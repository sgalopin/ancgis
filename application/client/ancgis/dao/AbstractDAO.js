import ExtendedGeoJSON from '../../ol/format/ExtendedGeoJSON.js'

/**
 * @module ancgis/client/ancgis/dao/AbstractDAO
 */

/**
 * @classdesc
 * Abstract DAO
 *
 * @api
 */
class AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/AbstractDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    if(dbm){
      this.dbm = dbm;
    } else {
      throw new Error("A Database Manager is required");
    }
  }

  addEventListener(eventType, listener) {
    this.listeners = this.listeners ? this.listeners : {};
    this.listeners[eventType] = this.listeners[eventType] ? this.listeners[eventType] : [];
    this.listeners[eventType].push(listener);
  }

  dispatchEvent(e) {
    let eventType = e.type;
    this.listeners[eventType].forEach(function(listener){
      listener.call(this);
    });
  }

  dispatchDirtyAddedEvent() {
    this.dispatchEvent(new Event('dirtyAdded'));
  }

  getDirtyDocumentsCount(collection) {
    return this.dbm.getDirtyDocumentsCount(collection)
    .catch(error => console.error(error));
  }

  createFeature(collection, geoJsonFeature) {
    return this.dbm.create(collection, geoJsonFeature)
    .then(this.dispatchDirtyAddedEvent.bind(this))
    .catch(error => console.error(error));
  }

  updateFeature(collection, geoJsonFeature) {
    return this.dbm.update(collection, geoJsonFeature)
    .then(this.dispatchDirtyAddedEvent.bind(this))
    .catch(error => console.error(error));
  }

  deleteFeature(collection, id) {
    return this.dbm.delete(collection, id)
    .then(this.dispatchDirtyAddedEvent.bind(this))
    .catch(error => console.error(error));
  }

  downloadFeatures(collection) {
    return this.dbm.downloadFeatures(collection)
    .catch(error => console.error(error));
  }

  uploadFeatures(collection) {
    return this.dbm.uploadFeatures(collection)
    .catch(error => console.error(error));
  }

  async featuresToGeoJson(collection) {
    let extendedGeoJSON = new ExtendedGeoJSON();
    return extendedGeoJSON.readFeatures({
      "type": "FeatureCollection",
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:3857"
        }
      },
      "features": await this.dbm.readAll(collection)
    });
  }
};

export default AbstractDAO;