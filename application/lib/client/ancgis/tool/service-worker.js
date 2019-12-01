import * as log from "loglevel";

// Add Service worker for cache
export function addServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/cache.js")
    .then(function(registration) {
      log.debug("Registration successful, scope is:", registration.scope);
    })
    .catch(function(error) {
      log.error("Service worker registration failed, error:", error);
    });
  }
}
