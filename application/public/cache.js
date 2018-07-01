self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open("ancgis-statics-ressources").then(function(cache) {
      return cache.addAll(
        [
          '/manifest.json',
          'https://openlayers.org/en/v4.6.5/css/ol.css',
          'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
          './stylesheets/style.css',
          'https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList,URL',
          'https://openlayers.org/en/v4.6.5/build/ol-debug.js',
          'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
          'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'
        ]
      );
    })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});