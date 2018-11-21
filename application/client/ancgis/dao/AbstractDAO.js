import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";

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
        listener.call(this);
      });
    }
  }

/* eslint-enable security/detect-object-injection */

  dispatchDirtyAddedEvent() {
    this.dispatchEvent(new Event("dirtyAdded"));
  }

  getDirtyDocumentsCount(collection) {
    return this.dbm.getDirtyDocumentsCount(collection)
    .catch((error) => console.error(error));
  }

  createFeature(collection, geoJsonFeature) {
    let promise =  this.dbm.create(collection, geoJsonFeature)
    .catch((error) => console.error(error));
    promise.then(this.dispatchDirtyAddedEvent.bind(this));
    return promise;
  }

  updateFeature(collection, geoJsonFeature) {
    let promise = this.dbm.update(collection, geoJsonFeature)
    .catch((error) => console.error(error));
    promise.then(this.dispatchDirtyAddedEvent.bind(this));
    return promise;
  }

  deleteFeature(collection, id) {
    let promise = this.dbm.delete(collection, id)
    .catch((error) => console.error(error));
    promise.then(this.dispatchDirtyAddedEvent.bind(this));
    return promise;
  }

  downloadFeatures(collection) {
    return this.dbm.downloadFeatures(collection)
    .catch((error) => console.error(error));
  }

  uploadFeatures(collection) {
    return this.dbm.uploadFeatures(collection);
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
}

export default AbstractDAO;