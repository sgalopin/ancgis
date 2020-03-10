/**
 * @module ancgis/client/ancgis/dao/PedoclimaticZoneDAO
 */
import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import uuidv1 from "uuid/v1";
import * as turf from "@turf/intersect";
import turfBooleanWithin from "@turf/boolean-within";
import { point } from '@turf/helpers'

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
    this.collection = "pedoclimatic_zones";
  }

  // Returns the feature's JSON
  featureToJSON(feature) {
    // Setup the geojsonPpts var
    var ppts = feature.getProperties();
    const format = new ExtendedGeoJSON();

    return {
      type: "Feature",
      properties: {
          acidity : ppts.acidity ? ppts.acidity : null,
          moisture : ppts.moisture ? ppts.moisture : null,
          texture : ppts.texture ? ppts.texture : null,
          salinity :  ppts.salinity ?  ppts.salinity : null,
          organicmat : ppts.organicmat ? ppts.organicmat : null,
          nutrients : ppts.nutrients ? ppts.nutrients : null,
          brightness : ppts.brightness ? brightness.brightness : null,
          moisture_atmo: obj.moisture_atmo ?  ppts.moisture_atmo : null,
          temperature : ppts.temperature ? ppts.temperature : null,
          continentality : ppts.continentality ? ppts.continentality : null,
          id: ppts.id ? ppts.id : null
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }

  // Returns the intersected zones
  getIntersectedZones(vegetationZone) {
    var vegZone = new Array();
    for (var v = 0; vegetationZone.values_.geometry.flatCoordinates.length; v = v+2){
       var pt = point([vegetationZone.values_.geometry.flatCoordinates[v], vegetationZone.values_.geometry.flatCoordinates[v+1]]);
        console.log(pt.geometry);
        // vegZone.push(toWgs84(pt));
    }
    console.log(vegetationZone.values_.geometry.flatCoordinates);
    //var vegZone = turf.polygon([vegetationZone.geometry]);


    var obj = Object.values(feature.features);
    var categ = new Array();

    for(let prop in obj){
        for (let c in Object.values(obj[prop].geometry.coordinates)){

            var poly = turf.polygon([obj[prop].geometry.coordinates[c]]);

            // Does the first geometry contain the second geometry ?
            var boolWithin = turf.booleanWithin(vegZone, poly);

            // If yes, we keep the second geometry directly :
            if (boolWithin == true){
                // Retrieval id of the zonePedo
                categ.push(obj[prop].properties);
            }else{
                // Otherwise, it is necessary to do an intersection of the two geometries
                var inters = turf.intersect(vegZone, poly);

                if (inters != null){
                    // Retrieval id of the zonePedo
                    categ.push(obj[prop].properties);
                }
            }
        }
    }
    return categ ;
  }
}

export default PedoclimaticZoneDAO;
