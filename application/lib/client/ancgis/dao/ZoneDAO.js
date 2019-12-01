/**
 * @module ancgis/client/ancgis/dao/ZoneDAO
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
class ZoneDAO extends AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/ZoneDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    super(dbm);
    this.collection = "vegetation-zones";
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
        account: userInfo.id,
        type: ppts.type ? ppts.type : null,
        flore: ppts.flore ? ppts.flore.map(function(obj) {
            return { taxon: obj.taxon.id, recovery: obj.recovery };
        }) : []
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }
}

export default ZoneDAO;
