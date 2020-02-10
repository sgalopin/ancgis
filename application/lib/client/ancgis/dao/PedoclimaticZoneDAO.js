/**
 * @module ancgis/client/ancgis/dao/PedoclimaticZoneDAO
 */

import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import uuidv1 from "uuid/v1";
import * as turf from "@turf/intersect"

/**
 * @classdesc
 * Pedoclimatic Zone DAO
 *
 * @api
 */
class PedoclimaticZoneDAO extends AbstractDAO {

  /**
   * @param {module:ancgis/client/ancgis/dao/PedoclimaticZoneDAO~Dbm=} dbm Dbm.
   */
  constructor(dbm) {
    super(dbm);
    this.collection = "pedoclimatic-zones";
  }

  // Returns the feature's JSON
  featureToJSON(feature) {
    // Setup the geojsonPpts var
    var ppts = feature.getProperties();
    const format = new ExtendedGeoJSON();

    return {
      id: feature.getId() || uuidv1(),
      type: "Feature",
      properties: {
        // TODO
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }

  // Returns the intersected zones
  getIntersectedZones(vegetationZone) {
    // TODO: use turf here
  }
}

export default PedoclimaticZoneDAO;
