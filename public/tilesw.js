
importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js')

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

  const mapProvider = await idbKeyVal.get("mapProvider")

  if (url.includes(mapProvider)) {
    event.respondWith(
      (async () => {
        try {
          console.log('[SW] Checking cache for:', url);
          // Try to get from cache first
          const cachedBlob = await idbKeyval.get(url);
          if (cachedBlob) {
            console.log('[SW] Cache hit for:', url);
            return new Response(cachedBlob);
          }
          console.log('[SW] Cache miss for:', url);

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
            await idbKeyval.set(url, blob);
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
});
