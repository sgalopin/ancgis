/**
 * @module ancgis/client/ancgis/dao/HiveDAO
 */

import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import {getUserInfo} from "../tool/cookie.js";
import uuidv1 from "uuid/v1";

/**
 * @classdesc
 * Hive DAO
 *
 * @api
 */
class HiveDAO extends AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/HiveDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    super(dbm);
    this.collection = "hives";
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
        type : ppts.type ? ppts.type : null,
        framesCount : ppts.framesCount ? ppts.framesCount : null
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }
}

export default HiveDAO;
