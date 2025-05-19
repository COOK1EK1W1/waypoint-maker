export const registerServiceWorker = async () => {
  if (typeof navigator !== "undefined" && 'serviceWorker' in navigator) {
    try {
      // add the tile cache service worker
      const registration = await navigator.serviceWorker.register('/tilesw.js');
      console.log('Service Worker registered with scope:', registration.scope);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}; 
