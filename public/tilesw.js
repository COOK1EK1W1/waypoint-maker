importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6.2.2/dist/umd.min.js')

const providerStore = idbKeyval.createStore('mapProvider', 'providerData')
const tileStore = idbKeyval.createStore('mapStore', 'tileStore')

function extractTemplateValues(template, url) {
  // Convert template to regex by replacing {key} with named capture groups
  const pattern = template.replace(/\{(\w+)\}/g, (_, key) => `(?<${key}>[^/]+)`);
  const regex = new RegExp(`^${pattern}$`);

  const match = url.match(regex);
  return match ? match.groups : null;
}


self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      self.skipWaiting()
    ])
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim()
    ])
  );
});


self.addEventListener("fetch", async (event) => {
  const url = event.request.url;

  // Immediately respond with a promise to prevent race conditions
  event.respondWith(
    (async () => {

      try {
        const mapProvider = await idbKeyval.get("providerUrl", providerStore);
        const params = extractTemplateValues(mapProvider, url);

        if (params !== null && "x" in params && "y" in params && "z" in params) {
          const tileName = `tile:${params.x}:${params.y}:${params.z}`;

          const cachedResponse = await idbKeyval.get(tileName, tileStore)

          if (cachedResponse) {
            console.log('[SW] Cache hit for:', tileName);
            return new Response(cachedResponse);
          }

          // If not in cache or timeout, fetch from network
          const fetchOptions = {
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
              'Referer': self.location.origin
            }
          };

          const response = await fetch(url, fetchOptions);

          if (!response.ok) {
            return response;
          }

          // Cache the response in the background
          response.clone().blob().then(blob => {
            idbKeyval.set(tileName, blob, tileStore)
              .catch(err => console.error('[SW] Cache write failed:', err));
          });

          return response;
        }
      } catch (err) {
        console.warn("[SW] Error handling request:", err);
        // Fallback to direct fetch
        try {
          const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
              'Referer': self.location.origin
            }
          });
          return response;
        } catch (fallbackErr) {
          console.error("[SW] Fallback fetch failed:", fallbackErr);
          return new Response(null, {
            status: 504,
            statusText: 'Gateway Timeout'
          });
        }
      }
    })()
  );
});
