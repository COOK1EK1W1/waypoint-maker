// local version so we can work offline
importScripts('/idb-keyval.js')


// when changing this code, either unregister and refresh or update form the application tab
// Also firefox doesn't console.log anything so pls use a chromium based browser

// get the two stores from db
const providerStore = idbKeyval.createStore('mapProvider', 'providerData')
const tileStore = idbKeyval.createStore('mapStore', 'tileStore')

const DEBUG = false

function extractTemplateValues(template, url) {
  // Convert template to regex by replacing {key} with named capture groups
  const pattern = template.replace(/\{(\w+)\}/g, (_, key) => `(?<${key}>[^/]+)`);
  const regex = new RegExp(`^${pattern}$`);

  const match = url.match(regex);
  return match ? match.groups : null;
}


// skip waiting phase of service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      self.skipWaiting()
    ])
  );
});

// allow service worker to work on first load
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim()
    ])
  );
});


self.addEventListener("fetch", async (event) => {
  const url = event.request.url;

  // Only respond to requests that end with #tile
  if (!url.endsWith('#tile')) {
    return;
  }

  // Immediately respond with a promise to prevent race conditions
  event.respondWith(
    (async () => {
      try {

        // find the tile coordinates
        const mapProvider = await idbKeyval.get("providerUrl", providerStore);
        const coords = extractTemplateValues(mapProvider, url.slice(0, -5));

        // if we found the coordinates
        if (coords !== null && "x" in coords && "y" in coords && "z" in coords) {

          const tileName = `tile:${coords.x}:${coords.y}:${coords.z}`;
          const cachedResponse = await idbKeyval.get(tileName, tileStore)

          // CACHE HIT
          if (cachedResponse) {
            if (DEBUG) console.log('[SW] Cache hit for:', tileName);
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

          // fetch the request
          if (DEBUG) console.log("requesting ", url.slice(0, -5))
          const response = await fetch(url.slice(0, -4), fetchOptions);

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

        // Fallback, do the request and return the repsonse
        return new Response(await fetch(url))
      }
    })()
  );
});
