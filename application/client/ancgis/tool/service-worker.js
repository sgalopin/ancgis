// Add Service worker for cache
export function addServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/cache.js")
    .then(function(registration) {
      console.log("Registration successful, scope is:", registration.scope);
    })
    .catch(function(error) {
      console.log("Service worker registration failed, error:", error);
    });
  }
}