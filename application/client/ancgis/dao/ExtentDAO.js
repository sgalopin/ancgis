/**
 * @module ancgis/client/ancgis/dao/ExtentDAO
 */

import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from '../../ol/format/ExtendedGeoJSON.js';
import {getUserInfo} from "../tool/cookie.js";
import uuidv1 from "uuid/v1";

/**
 * @classdesc
 * Hive DAO
 *
 * @api
 */
class ExtentDAO extends AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/ExtentDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    super(dbm);
    this.collection = "extents";
  }

  getDirtyDocumentsCount() {
    return super.getDirtyDocumentsCount(this.collection);
  }

  // Returns the feature's JSON
  featureToJSON(feature) {
    // Setup the geojsonPpts var
    var ppts = feature.getProperties();
    const format = new ExtendedGeoJSON();
    const userInfo =  getUserInfo();

    return {
      id: feature.getId() || uuidv1(),
      type: "Feature",
      properties: {
        account: userInfo.id
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }

  // Create function
  createFeature(feature) {
    return super.createFeature(this.collection, this.featureToJSON(feature))
    .then(function(doc){
      feature.setId(doc.id);
    });
  }

  // Update function
  updateFeature(feature) {
    return super.updateFeature(this.collection, this.featureToJSON(feature));
  }

  // Delete function
  deleteFeature(feature) {
    return super.deleteFeature(this.collection, feature.getId());
  }

  downloadFeatures() {
    return super.downloadFeatures(this.collection);
  }

  uploadFeatures() {
    return super.uploadFeatures(this.collection);
  }

  featuresToGeoJson() {
    return super.featuresToGeoJson(this.collection);
  }
}

export default ExtentDAO;