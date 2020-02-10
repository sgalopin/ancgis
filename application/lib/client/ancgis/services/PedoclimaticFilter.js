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
    this.filteredTaxonsList = this.getFilteredTaxonsList();

  }

  /**
   * Get the pedoclimatic zones intersecting the vegetation zone from the locale table.
   * @return {array} The pedoclimatic zones.
   * @private
   */
  getPedoclimaticZones() {
    const self = this;
    let pcZoneDAO = new PedoclimaticZoneDAO(self.idbm); // TODO
    return pcZoneDAO.getIntersectedZones(self.vegetationZone); // TODO
  }

  /**
   * Get the pedoclimatic vectors.
   * @return {array} The pedoclimatic vectors.
   * @private
   */
  getPedoclimaticVectors() {
    const self = this;
    let pcZones = self.getPedoclimaticZones();
    let pcVectors = [];
    // TODO: foreach pcZones ...
    return pcVectors;
  }

  /**
   * Get the filtered taxons list.
   * @return {array} The filtered taxons list.
   * @private
   */
  getFilteredTaxonsList() {
    const self = this;
    let pcZones = self.getPedoclimaticVectors();
    let filteredTaxonsList = [];
    // TODO: foreach this.fullTaxonsList ...
    return filteredTaxonsList;
  }

  /**
   * Get the filtered taxons list.
   * @return {array} The filtered taxons list.
   * @public
   */
  getList() {
    return this.filteredTaxonsList;
  }
}

export default PedoclimaticFilter;
