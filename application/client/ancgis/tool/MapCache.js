/**
 * @module ancgis/client/ancgis/tool/MapCache
 */

/**
 * @classdesc
 * Manage the map cache
 *
 * @api
 */
class MapCache {

  /**
   * @param {module:ancgis/client/ancgis/tool/MapCache~Options=} options Options.
   */
  constructor(options) { // eslint-disable-line complexity
    // Checks the required options
    if (!options.map) {
      throw new Error("MapCache requires a map.");
    }
    if (!options.extentsLayerName) {
      throw new Error("MapCache requires a extents layer name.");
    }
    if (!options.catchedLayerNames) {
      throw new Error("MapCache requires a catched layer name.");
    }

    // Sets the class attributs
    this.map = options.map;
    this.extentsLayerName = options.extentsLayerName;
    this.catchedLayerNames = Array.isArray(options.catchedLayerNames) ? options.catchedLayerNames : [options.catchedLayerNames];
  }

  getTilesUrls() {
    const self = this;
    let tilesurls = [];
    // For each extent
    const extentsFeatures = self.map.getLayerByName(self.extentsLayerName).getSource().getFeatures();
    extentsFeatures.forEach(function(extentFeature){
      const extent = extentFeature.getGeometry().getExtent();
      // For each catched layer
      self.catchedLayerNames.forEach(function(layerName){
        const source = self.map.getLayerByName(layerName).getSource();
        const urls = self.map.getExtendTilesUrls(extent, source);
        Array.prototype.push.apply(tilesurls, urls);
      });
    });
    // Removes duplicate and return
    let filteredUrls = tilesurls.filter(
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
    );
    return filteredUrls;
  }

  updateCache() {
    const cacheName = "ancgis-statics-tiles";
    const self = this;
    const urls = self.getTilesUrls();
    let count = 0;
    // Delete the cache
    caches.delete(cacheName).then(function(boolean) { // eslint-disable-line security/detect-object-injection
      caches.open(cacheName).then(function(cache) { // eslint-disable-line security/detect-object-injection
        // Dispatch a event to display the map cache info toolbar.
        self.dispatchTileAddedEvent(0, urls.length);
          urls.forEach(function(url) {
          // Prepare the request and fetch the tile
          const myHeaders = new Headers({
            "X-Custom-Header": "MapCacheRequest",
          });
          const myInit = {
            method: "GET",
            headers: myHeaders,
            mode: "cors", // will allow requests for assets on the same-origin and other origins which return the appropriate CORs headers.
            cache: "no-cache" // means always validate a response that is in the HTTP cache even if the browser thinks that it’s fresh.
          };
          fetch(url, myInit).then(function (response) {
            count++;
            self.dispatchTileAddedEvent(count, urls.length);
            // Add the tile to the cache
            return cache.put(url, response);
          })
          .catch(function(error) {
            self.dispatchCacheUpdateErrorEvent("Erreur réseau lors de la mise à jour du cache cartographique. Veuillez réessayer.");
            console.error("Fetching map cache failed:", error);
          });
        });
      });
    });
  }

  /* eslint-disable security/detect-object-injection */

  addEventListener(eventType, listener) {
    this.listeners = this.listeners ? this.listeners : {};
    this.listeners[eventType] = this.listeners[eventType] ? this.listeners[eventType] : [];
    this.listeners[eventType].push(listener);
  }

  dispatchEvent(e) {
    let eventType = e.type;
    if (this.listeners && this.listeners[eventType]) {
      this.listeners[eventType].forEach(function(listener) {
        listener.apply(this, e.detail);
      });
    }
  }

  /* eslint-enable security/detect-object-injection */

  dispatchTileAddedEvent() {
    this.dispatchEvent(new CustomEvent("tileAdded", { "detail": arguments }));
  }

  dispatchCacheUpdateErrorEvent() {
    this.dispatchEvent(new CustomEvent("cacheUpdateError", { "detail": arguments }));
  }
}

export default MapCache;
