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
          brightness : ppts.brightness ? brightness.brightness : null,
          moisture_atmo: obj.moisture_atmo ?  ppts.moisture_atmo : null,
          temperature : ppts.temperature ? ppts.temperature : null,
          continentality : ppts.continentality ? ppts.continentality : null,
      },
      geometry: format.writeGeometryObject(ppts.geometry)
    };
  }

  // Returns the intersected zones
  getIntersectedZones(vegetationZone){
    //--------------Change of the projection in the VegetationZone-----------------//
    var vegZone = new Array();

    for (var v = 0; v < vegetationZone.values_.geometry.flatCoordinates.length; v = v+2){
      var pt = turf.point([vegetationZone.values_.geometry.flatCoordinates[v], vegetationZone.values_.geometry.flatCoordinates[v+1]]);
      vegZone.push(turf.toWgs84(pt).geometry.coordinates); // Projection in WGS84, EPSG : 4326
    }

    //--------------Use of the new format-------------//
    var vegZoneGeom = turf.polygon([vegZone]);
    console.log(vegZoneGeom);

    //--------------Reading of the PedoclimaticZones Table-----------//

    this.dbm.readAll(this.collection)
      .then(function(pcZones) {
        let splitedZones = [];
        pcZones.forEach(function(pcZone){
          console.log('cc');
          let pcZonesNames = pcZone.name.fr.split(', ');
          pcZonesNames.forEach(function(pcZonesName, index){
            splitedZones.push({
              id: pcZone.id,
              name: pcZonesName,
              synonymous: index !== 0,
              smartflore: pcZone.urns.fr.telabotanica
            });
          });
        });
        console.log(splitedZones);
      });

    // var pedocli = new PedoclimaticZoneDAO(this.dbm);
    // console.log(pedocli);
    // pedocli.readAll(this.collection);
     // console.log(pedocli);

    var obj = Object.values(pedocli.features);
    var categ = new Array();

    for(let prop in obj){
        for (let c in Object.values(obj[prop].geometry.coordinates)){

            var poly = turf.polygon([obj[prop].geometry.coordinates[c]]);

            // Does the first geometry contain the second geometry ?
            var boolWithin = turf.booleanWithin(vegZoneGeom, poly);

            // If yes, we keep the second geometry directly :
            if (boolWithin == true){
                // Retrieval id of the zonePedo
                categ.push(obj[prop].properties);
            }else{
                // Otherwise, it is necessary to do an intersection of the two geometries
                var inters = turf.intersect(vegZoneGeom, poly);

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
