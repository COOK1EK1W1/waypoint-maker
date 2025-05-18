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
  try {
    const url = event.request.url;

    const mapProvider = await idbKeyval.get("providerUrl", providerStore)
    const params = extractTemplateValues(mapProvider, url)

    if (params !== null && "x" in params && "y" in params && "z" in params) {
      const tileName = `tile:${params.x}:${params.y}:${params.z}`
      event.respondWith(
        (async () => {
          try {
            console.log('[SW] Checking cache for:', tileName);
            // Try to get from cache first
            const cachedBlob = await idbKeyval.get(tileName, tileStore);
            if (cachedBlob) {
              console.log('[SW] Cache hit for:', tileName);
              return new Response(cachedBlob);
            }
            console.log('[SW] Cache miss for:', tileName);

            // If not in cache, fetch from network with CORS headers
            const fetchOptions = {
              ...event.request,
              mode: 'cors',
              credentials: 'omit',
              headers: {
                ...event.request.headers,
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': self.location.origin
              }
            };

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
              console.warn(`[SW] Network response not ok: ${response.status} for ${url}`);
              return response;
            }

            // Cache the response
            console.log('[SW] Caching response for:', url);
            const blob = await response.clone().blob();
            try {
              await idbKeyval.set(tileName, blob, tileStore);
              console.log('[SW] Successfully cached:', url);
            } catch (cacheError) {
              console.error('[SW] Failed to cache:', url, cacheError);
            }

            return response;
          } catch (err) {
            console.warn("[SW] Network failed, tile not found in IndexedDB:", url, err);
            // Instead of returning a 504, try to fetch directly without caching
            try {
              const fetchOptions = {
                mode: 'cors',
                credentials: 'omit',
                headers: {
                  'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                  'Referer': self.location.origin
                }
              };
              const response = await fetch(url, fetchOptions);
              if (response.ok) {
                return response;
              }
            } catch (fallbackErr) {
              console.error("[SW] Fallback fetch also failed:", fallbackErr);
            }
            // Only return 504 if both attempts fail
            return new Response(null, {
              status: 504,
              statusText: 'Gateway Timeout'
            });
          }
        })()
      );
    }
  } catch (err) {
    console.log(err)
  }
});
