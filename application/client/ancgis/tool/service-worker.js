// Add Service worker for cache
export function addServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/cache.js")
    .then(function(registration) {
      console.debug("Registration successful, scope is:", registration.scope);
    })
    .catch(function(error) {
      console.error("Service worker registration failed, error:", error);
    });
  }
}