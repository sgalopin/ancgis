self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open("ancgis-statics-ressources").then(function(cache) {
      return cache.addAll(
        [
          // Code
          '/',
          '/manifest.json',
          '/stylesheets/style.css',
          '/rest/taxons',
          '/javascripts/app.bundle.js',
          '/javascripts/tools.bundle.js',
          // Map's tiles
          'https://wxs.ign.fr/7wbodpc2qweqkultejkb47zv/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=17&TileCol=66545&TileRow=45516',
          'https://wxs.ign.fr/7wbodpc2qweqkultejkb47zv/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=17&TileCol=66545&TileRow=45515',
          'https://wxs.ign.fr/7wbodpc2qweqkultejkb47zv/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=17&TileCol=66544&TileRow=45516',
          'https://wxs.ign.fr/7wbodpc2qweqkultejkb47zv/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=17&TileCol=66544&TileRow=45515',
          // Images
          '/images/glyphicons/glyphicons-388-log-out.png',
          '/images/glyphicons/glyphicons-551-erase.png',
          '/images/glyphicons/glyphicons-31-pencil.png',
          '/images/glyphicons/glyphicons-187-move.png',
          '/images/glyphicons/glyphicons-96-vector-path-circle.png',
          '/images/glyphicons/glyphicons-97-vector-path-polygon.png',
          '/images/glyphicons/glyphicons-454-kiosk.png',
          '/images/glyphicons/glyphicons-194-ok-sign.png',
          '/images/glyphicons/glyphicons-193-remove-sign.png',
          '/images/glyphicons/glyphicons-191-plus-sign.png',
          '/images/glyphicons/glyphicons-208-remove.png'
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