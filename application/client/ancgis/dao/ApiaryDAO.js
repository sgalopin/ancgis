/**
 * @module ancgis/client/ancgis/dao/ApiaryDAO
 */

import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import {getUserInfo} from "../tool/cookie.js";
import uuidv1 from "uuid/v1";

/**
 * @classdesc
 * Apiary DAO
 *
 * @api
 */
class ApiaryDAO extends AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/ApiaryDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    super(dbm);
    this.collection = "apiaries";
  }

  // Returns the feature's JSON
  featureToJSON(feature) { // eslint-disable-line complexity
    // Setup the geojsonPpts var
    var ppts = feature.getProperties();
    const format = new ExtendedGeoJSON();
    const userInfo =  getUserInfo();

    return {
      id: feature.getId() || uuidv1(),
      type: "Feature",
      properties: {
        account: userInfo.id,
        registrationNumber : ppts.registrationNumber ?  ppts.registrationNumber : null,
        locationName : ppts.locationName ?  ppts.locationName : null,
        city : ppts.city ? ppts.city : null,
        zipCode : ppts.zipCode ? ppts.zipCode : null
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }
}

export default ApiaryDAO;
