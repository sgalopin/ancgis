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
    return new Promise((resolve, reject) => {
      super.uploadFeatures(this.collection).then(function(count){
        let msg = "<b>Soumission des zones de cache :</b> <b>" + count.added + "</b> zone(s) ajoutée(s), <b>" + count.updated + "</b> mise(s) à jour, <b>" + count.deleted + "</b> effacée(s).";
        resolve({ success: true, message: msg });
      }, function(response){
        let msg = "<b>La soumission des zones de cache a échoué:</b><br/>";
        $.each(response.details, function(id, message) {
          msg += "<a data-id=\"" + id + "\" title=\"" + id + "\" href=\"#\" data-toggle=\"tooltip\" data-placement=\"right\" data-container=\".alert-dismissible\">" + id.substring(0, 13) + "...</a> : " + message + "</br>";
        });
        msg = msg.substring(0, msg.length - 5); // Removes the trailing "</br>"
        resolve({ success: false, message: msg });
      });
    });
  }

  featuresToGeoJson() {
    return super.featuresToGeoJson(this.collection);
  }
}

export default ExtentDAO;