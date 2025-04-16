export const registerServiceWorker = async () => {
  console.log('registering')
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/tilesw.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.log("bruh")

  }
}; 
