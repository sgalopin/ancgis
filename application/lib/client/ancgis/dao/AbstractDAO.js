import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import * as log from "loglevel";

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

  getDirtyDocumentsCount() {
    return this.dbm.getDirtyDocumentsCount(this.collection)
    .catch((error) => log.error(error));
  }

  createFeature(feature) {
    let promise =  this.dbm.create(this.collection, this.featureToJSON(feature))
    .catch((error) => log.error(error));
    promise.then(this.dispatchDirtyAddedEvent.bind(this));
    promise.then(function(doc){
      feature.setId(doc.id);
    });
    return promise;
  }

  updateFeature(feature) {
    let promise = this.dbm.update(this.collection, this.featureToJSON(feature))
    .catch((error) => log.error(error));
    promise.then(this.dispatchDirtyAddedEvent.bind(this));
    return promise;
  }

  deleteFeature(feature) {
    let promise = this.dbm.delete(this.collection, feature.getId())
    .catch((error) => log.error(error));
    promise.then(this.dispatchDirtyAddedEvent.bind(this));
    return promise;
  }

  downloadFeatures() {
    return this.dbm.downloadFeatures(this.collection)
    .catch((error) => log.error(error));
  }

  uploadFeatures() {
    const self = this;
    return new Promise((resolve, reject) => {
      self.dbm.uploadFeatures(self.collection).then(function(count){
        resolve({ success: true, collection: self.collection, count });
      }, function(response){
        resolve({ success: false, collection: self.collection, details: response.details });
      });
    });
  }

  async featuresToGeoJson() {
    const self = this;
    let extendedGeoJSON = new ExtendedGeoJSON();
    return extendedGeoJSON.readFeatures({
      "type": "FeatureCollection",
      "crs": {
        "type": "name",
        "properties": {
          "name": "EPSG:3857"
        }
      },
      "features": await this.dbm.readAll(self.collection)
    });
  }
}

export default AbstractDAO;
