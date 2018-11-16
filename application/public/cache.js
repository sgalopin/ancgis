self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("ancgis-statics-ressources").then(function(cache) {
      const urls = [
        // Code
        "/",
        "/manifest.json",
        "/stylesheets/style.css",
        "/javascripts/app.bundle.js",
        "/javascripts/tools.bundle.js",
        // Data
        "/rest/taxons",
        // Images
        "/images/glyphicons/glyphicons-388-log-out.png",
        "/images/glyphicons/glyphicons-551-erase.png",
        "/images/glyphicons/glyphicons-31-pencil.png",
        "/images/glyphicons/glyphicons-187-move.png",
        "/images/glyphicons/glyphicons-96-vector-path-circle.png",
        "/images/glyphicons/glyphicons-97-vector-path-polygon.png",
        "/images/glyphicons/glyphicons-454-kiosk.png",
        "/images/glyphicons/glyphicons-194-ok-sign.png",
        "/images/glyphicons/glyphicons-193-remove-sign.png",
        "/images/glyphicons/glyphicons-191-plus-sign.png",
        "/images/glyphicons/glyphicons-208-remove.png",
        "/images/glyphicons/glyphicons-201-download.png",
        "/images/glyphicons/glyphicons-202-upload.png",
        "/images/glyphicons/glyphicons-100-vector-path-all.png",
        "/images/glyphicons/glyphicons-517-menu-hamburger.png",
        "/images/glyphicons/glyphicons-488-fit-image-to-frame.png",
        "/images/warning.png",
        "/images/blank.jpg"
      ];
      urls.forEach(function(url) {
        // Prepare the request and fetch the tile
        const myInit = {
          method: "GET",
          mode: "same-origin", // only succeeds for requests for assets on the same origin, all other requests will reject.
          cache: "no-cache" // means always validate a response that is in the HTTP cache even if the browser thinks that it’s fresh.
        };
        fetch(url, myInit).then(function (response) {
          // Add the tile to the cache
          return cache.put(url, response);
        })
        .catch(function(error) {
          console.error("Fetching install cache failed:", error);
        });
      });
    })
  );
});

/**
 * Important note:
 * In dev mode, check "Update on reload" in the DevTools Application panel
 * to update the Service Worker and so the "install" cache on reload.
 * For all modifications, check the update of the "cache.js" file
 * in the DevTools Source panel before any interpretation.
 */
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function(cacheResponse) {
      if (cacheResponse) {
        return cacheResponse;
      } else {
        return fetch(event.request)
        .catch(async function(error) {
          if (
            event.request.url.startsWith("https://wxs.ign.fr")
            && event.request.headers.get("X-Custom-Header") !== "MapCacheRequest") {
            return await caches.match(new Request("/images/blank.jpg"));
          } else {
            console.error("Fetching failed:", error);
          }
        });
      }
    })
  );
});