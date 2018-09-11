self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open("ancgis-statics-ressources").then(function(cache) {
      return cache.addAll(
        [
          '/',
          '/manifest.json',
          './stylesheets/style.css',
          '/login',
          '/rest/taxons',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
          'https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList,URL',
          'https://code.jquery.com/jquery-3.3.1.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
          'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js'

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