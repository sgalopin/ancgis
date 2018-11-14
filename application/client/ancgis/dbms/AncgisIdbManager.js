import SyncIdbManager from "./SyncIdbManager.js";

/**
 * @module ancgis/client/ancgis/dbms/AncgisIdbManager
 */

/**
 * @classdesc
 * Manage the Ancgis indexed database.
 *
 * @api
 */
class AncgisIdbManager extends SyncIdbManager {

  /**
   * @param {module:ancgis/client/ancgis/dbms/SyncIdbManager~Options=} opt_options Options.
   */
  constructor(opt_options) {
    super(opt_options);
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
                specie.taxon = await self.readStore(taxonStore, specie.taxon);
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

  readAll(collection) {
    if (collection === "vegetation-zones") {
      return this.readAllVegetationZones();
    } else {
      return super.readAll(collection);
    }
  }

}
export default AncgisIdbManager;