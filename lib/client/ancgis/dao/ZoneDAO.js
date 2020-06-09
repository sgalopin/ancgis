/**
 * AncGIS - Web GIS for the analysis of honey resources around an apiary
 * Copyright (C) 2020  Sylvain Galopin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
 
/**
 * @module ancgis/client/ancgis/dao/ZoneDAO
 */

import AbstractDAO from "./AbstractDAO.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import {getUserInfo} from "../tool/cookie.js";
import uuidv1 from "uuid/v1";

/**
 * @classdesc
 * Zone DAO
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
