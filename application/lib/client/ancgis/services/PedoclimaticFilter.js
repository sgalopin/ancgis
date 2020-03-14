/**
 * @module ancgis/client/ancgis/services/PedoclimaticFilter
 */

import * as log from "loglevel";
import PedoclimaticZoneDAO from "../dao/PedoclimaticZoneDAO.js";

/**
 * @classdesc
 * A pedoclimatic filter for the taxon list.
 *
 * @api
 */
class PedoclimaticFilter {

  /**
   * @param {module:ancgis/client/ancgis/services/PedoclimaticFilter~Options=} options Options.
   */
  constructor(options) { // eslint-disable-line complexity
    // Checks the required options
    if (!options.idbm) {
      throw new Error("PedoclimaticFilter requires a database connection.");
    }
    if (!options.vegetationZone) {
      throw new Error("PedoclimaticFilter requires a vegetation zone.");
    }
    if (!options.taxonsList) {
      throw new Error("PedoclimaticFilter requires a taxons list.");
    }

    // Sets the class attributs
    this.idbm = options.idbm;
    this.vegetationZone = options.vegetationZone;
    this.fullTaxonsList = options.taxonsList;
  }

  /**
   * Get the pedoclimatic zones intersecting the vegetation zone from the locale table.
   * @return {array} The pedoclimatic zones.
   * @private
   */
  async getPedoclimaticZones() {
    const self = this;
    let pcZoneDAO = new PedoclimaticZoneDAO(self.idbm);
    return await pcZoneDAO.getIntersectedZones(self.vegetationZone);
  }

  /**
   * Get the pedoclimatic vector.
   * @param {number|array} data the vector value(s) to add.
   * @param {array} oldDataVector the current vector.
   * @return {array} The pedoclimatic vector.
   * @private
   */
  getVector(data, oldDataVector) {
    if ( data === null ) { // Data is null
      return oldDataVector
    } else {
      // Initialization
      let tmpDataVector;
      if ( typeof oldDataVector === "undefined" ) {
        oldDataVector = [];
      }
      if ( typeof data === 'object' && data !== null ) { // Data is an array
         tmpDataVector = oldDataVector.concat(data);
      } else if (typeof data === 'number') { // Data is an number
         tmpDataVector = oldDataVector.concat([data]);
      }
      return [Math.min(...tmpDataVector), Math.max(...tmpDataVector)];
    }
  }

  /**
   * Get the pedoclimatic vectors.
   * @return {array} The pedoclimatic vectors.
   * @private
   */
  async getPedoclimaticVectors() {
    const self = this;
    let pcZones = await self.getPedoclimaticZones();
    let pcVectors = {};
    pcZones.forEach(function(pcZone){
      let p = pcZone.properties;
      pcVectors = {
        acidity : self.getVector(p.acidity, pcVectors.acidity),
        moisture : self.getVector(p.moisture, pcVectors.moisture),
        texture : self.getVector(p.texture, pcVectors.texture),
        salinity :  self.getVector(p.salinity, pcVectors.salinity),
        organicmat : self.getVector(p.organicmat, pcVectors.organicmat),
        nutrients : self.getVector(p.nutrients, pcVectors.nutrients),
        brightness : self.getVector(p.brightness, pcVectors.brightness),
        moisture_atmo: self.getVector(p.moisture_atmo, pcVectors.moisture_atmo),
        temperature : self.getVector(p.temperature, pcVectors.temperature),
        continentality : self.getVector(p.continentality, pcVectors.continentality)
      }
    });
    return pcVectors;
  }

  /**
   * Get the taxon vectors.
   * @param {object} taxon the taxon object.
   * @return {array} The taxon vectors.
   * @private
   */
  getTaxonVectors(taxon) {
    const self = this;
    return {
      acidity : self.getVector(taxon.ecology.soil.acidity),
      moisture : self.getVector(taxon.ecology.soil.moisture),
      texture : self.getVector(taxon.ecology.soil.texture),
      salinity :  self.getVector(taxon.ecology.soil.salinity),
      organicmat : self.getVector(taxon.ecology.soil.organicMaterial),
      nutrients : self.getVector(taxon.ecology.soil.nutrients),
      brightness : self.getVector(taxon.ecology.climate.brightness),
      moisture_atmo: self.getVector(taxon.ecology.climate.moisture),
      temperature : self.getVector(taxon.ecology.climate.temperature),
      continentality : self.getVector(taxon.ecology.climate.continentality)
  };
 }

/**
 * Get the filtered taxons list.
 * @return {array} The filtered taxons list.
 * @private
 */
  async getFilteredTaxonsList() {
    const self = this;
    let pcVectors = await self.getPedoclimaticVectors();

    //for(let gap = 2; gap < 9; gap += 0.05){
      //gap = Math.round(gap * 100) / 100
      const gap = 6;
      let filteredTaxonsList = [];
      self.fullTaxonsList.forEach(function(taxon){
        if (self.getGap(taxon, pcVectors) < gap) {
          filteredTaxonsList.push(taxon)
        }
      });
      //console.log(gap + "; " + filteredTaxonsList.length)
    //}
    //console.log("fullsize",self.fullTaxonsList.length);
    return filteredTaxonsList;
  }

  /**
   * Get the vectors's gap.
   * @param {object} vectZones the vectZones object.
   * @param {object} taxon the taxon object.
   * @return {number} The vectors's gap.
   * @private
   */
  getGap(taxon, pcVectors) {
    const self = this;
    const tVectors = self.getTaxonVectors(taxon);
    let gap = 0;

    for (let [dataName, tVector] of Object.entries(tVectors)) {
      const tv = tVectors[dataName];
      const pcv = pcVectors[dataName];
      if (typeof pcv !== "undefined") {
        if(!(tv[0] >= pcv[0] && tv[0] <= pcv[1])
          && !(tv[1] <= pcv[1] && tv[1] >= pcv[0])) { // Not included
            gap += Math.pow(Math.min(Math.abs(pcv[0]-tv[1]),Math.abs(tv[0]-pcv[1])),2);
        }
      }
    }
    return Math.sqrt(gap);
  };

  /**
   * Get the filtered taxons list.
   * @return {array} The filtered taxons list.
   * @public
   */
  async getList() {
    this.filteredTaxonsList = await this.getFilteredTaxonsList();
    return this.filteredTaxonsList;
  }
}

export default PedoclimaticFilter;
