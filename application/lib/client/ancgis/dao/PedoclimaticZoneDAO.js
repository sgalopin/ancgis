/**
 * @module ancgis/client/ancgis/dao/PedoclimaticZoneDAO
 */
import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import uuidv1 from "uuid/v1";
import * as turf from '@turf/turf';

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
      id: feature.getId(),
      type: "Feature",
      properties: {
          acidity : ppts.acidity ? ppts.acidity : null,
          moisture : ppts.moisture ? ppts.moisture : null,
          texture : ppts.texture ? ppts.texture : null,
          salinity :  ppts.salinity ?  ppts.salinity : null,
          organicmat : ppts.organicmat ? ppts.organicmat : null,
          nutrients : ppts.nutrients ? ppts.nutrients : null,
          brightness : ppts.brightness ? ppts.brightness : null,
          moisture_atmo: ppts.moisture_atmo ?  ppts.moisture_atmo : null,
          temperature : ppts.temperature ? ppts.temperature : null,
          continentality : ppts.continentality ? ppts.continentality : null,
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }

  // Returns the intersected zones
  async getIntersectedZones(vegetationZone){

    // Transform the vegetation zone
    let coordinates = vegetationZone.getGeometry().clone().transform('EPSG:3857','EPSG:4326').getCoordinates();
    coordinates[0].push(coordinates[0][0]); // Close the polygon (required by turf)
    let tvZone = turf.polygon(coordinates);

    // Gets all the pcZones
    let pcZones = await this.dbm.readAll(this.collection);
    let intersectedZones = [];
    pcZones.forEach(function(pcZone){
      if(pcZone.geometry.type === "MultiPolygon"){
        // TODO: throws error "MultiPolygon not supported"
        //tpcZone = turf.multiPolygon(pcZone.geometry.coordinates);
      }
      let tpcZone = turf.polygon(pcZone.geometry.coordinates);
      if (turf.intersect(tvZone, tpcZone) != null) {
          intersectedZones.push(pcZone);
      }
    });
    return intersectedZones;
  }
}

export default PedoclimaticZoneDAO;
