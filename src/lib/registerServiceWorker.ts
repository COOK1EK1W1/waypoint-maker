export const registerServiceWorker = () => {
  if (typeof navigator !== "undefined" && 'serviceWorker' in navigator) {
    try {
      // add the tile cache service worker
      navigator.serviceWorker.register('/tilesw.js').then((reg) => {
        console.log('Service Worker registered with scope:', reg.scope);
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}; 
