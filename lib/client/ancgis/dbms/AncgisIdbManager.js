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
 * @module ancgis/client/ancgis/dbms/AncgisIdbManager
 */

import SyncIdbManager from "./SyncIdbManager.js";
import Taxon from "../dao/Taxon.js";

/**
 * @classdesc
 * Manage the Ancgis indexed database.
 *
 * @api
 */
class AncgisIdbManager extends SyncIdbManager {

  /**
   * @param {module:ancgis/client/ancgis/dbms/SyncIdbManager~Options=} optOptions Options.
   */
  constructor(optOptions) {
    super(optOptions);
  }

  readStore(store, id) {
    return new Promise(function(resolve, reject) {
      let getRequest = store.get(id);
      getRequest.onsuccess = function(event) {
         if (event.target.result) {
             resolve(event.target.result);
         } else {
            reject(Error("Data not found in your database."));
         }
      };
      getRequest.onerror = function(event) {
        reject(Error("Unable to retrieve data from database."));
      };
    });
  }

  readAllVegetationZones() {
    let self = this;
    return new Promise(function(resolve, reject) {
      let data = [];
      let transaction = self.db.transaction(["vegetation-zones", "taxons"]);
      let zoneStore = transaction.objectStore("vegetation-zones");
      let taxonStore = transaction.objectStore("taxons");
      zoneStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
          let feature = cursor.value;
          if (!(feature.properties && feature.properties.metadata && feature.properties.metadata.deleted)) {
            // Populate the flore
            if (feature.properties.flore && feature.properties.flore.length > 0) {
              let flore = [];
              feature.properties.flore.forEach(async function(specie){
                specie.taxon = new Taxon(await self.readStore(taxonStore, specie.taxon));
                flore.push(specie);
              });
              feature.properties.flore = flore;
            }
            // The features must stay metadata free
            delete feature.properties.metadata;
            data.push(feature);
          }
          cursor.continue();
        }
        else {
          // No more entries
          resolve(data);
        }
      }; // TODO: Add an "onerror" handler ?
    });
  }

  readTaxons(id) {
    let self = this;
    return new Promise(function(resolve, reject) {
      var request = self.db.transaction(["taxons"])
      .objectStore("taxons")
      .get(id);
      request.onsuccess = function(event) {
         if (request.result) {
            resolve(new Taxon(request.result));
         } else {
            reject(Error("'" + id + "' not found in your database."));
         }
      };
      request.onerror = function(event) {
        reject(Error("Unable to retrieve '" + id + "' from database."));
      };
    });
  }

  readAll(collection) {
    if (collection === "vegetation-zones") {
      return this.readAllVegetationZones();
    } else {
      return super.readAll(collection);
    }
  }

  read(collection, id) {
    if (collection === "taxons") {
      return this.readTaxons(id);
    } else {
      return super.read(collection, id);
    }
  }
}
export default AncgisIdbManager;
