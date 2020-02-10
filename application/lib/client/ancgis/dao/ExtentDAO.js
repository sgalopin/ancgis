/**
 * @module ancgis/client/ancgis/dao/ExtentDAO
 */

import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import {getUserInfo} from "../tool/cookie.js";
import uuidv1 from "uuid/v1";

/**
 * @classdesc
 * Extent DAO
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
}

export default ExtentDAO;
