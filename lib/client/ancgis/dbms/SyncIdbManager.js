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
 * @module ancgis/client/ancgis/dbms/SyncIdbManager
 */

import IdbManager from "./IdbManager.js";
import {displayMapMessage} from "../tool/message.js";
import * as log from "loglevel";

/**
 * @classdesc
 * Manage the synchronization between the local and remote databases.
 *
 * @api
 */
class SyncIdbManager extends IdbManager {

  /**
   * @param {module:ancgis/client/ancgis/dbms/SyncIdbManager~Options=} optOptions Options.
   */
  constructor(optOptions) {

    super();

    const options = optOptions ? optOptions : {};
    this.restBaseUrl = options.restBaseUrl ? options.restBaseUrl : "/rest";
    this.submitErrors = {};  // eslint-disable-line security/detect-object-injection
  }

  // Open the database
  async openDB() {
    await super.openDB();

    // Add listeners
    this.db.addEventListener("create", this.onCreateEvent.bind(this));

    return this;
  }

  getRestUrl(collection) {
    return this.restBaseUrl + "/" + collection + "/";
  }

  getRemoteDocuments(collection) {
    return jQuery.getJSON(this.getRestUrl(collection));
  }

  // Create the doc remotly
  postLocalDocument(collection, doc) {
    let self = this;
    return jQuery.ajax({
      url: this.getRestUrl(collection),
      type: "POST",
      data: JSON.stringify(doc),
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    })
    .done(function() {
      self.onRemoteSuccess(collection, doc);
    })
    .fail(function( jqXHR, textStatus, errorThrown ) { // eslint-disable-line complexity
      if (jqXHR.readyState === 4 && jqXHR.responseJSON && jqXHR.responseJSON.error) {
        // HTTP error (can be checked by jqXHR.status and jqXHR.statusText)
        self.submitErrors[collection][doc.id] = jqXHR.responseJSON.error; // eslint-disable-line security/detect-object-injection
        log.error("Unable to synchronize  '" + doc.id + "'. Request Failed with error : " + jqXHR.responseJSON.error );
      } else {
        // something weird is happening
        log.error("Unable to synchronize  '" + doc.id + "'. Request Failed with status : " + textStatus, jqXHR );
      }
      if (errorThrown) { log.error(errorThrown); }
    });
  }

  // Updates the doc remotly
  putLocalDocument(collection, doc) {
    let self = this;
    return jQuery.ajax({
      url: this.getRestUrl(collection) + doc.id,
      type: "PUT",
      data: JSON.stringify(doc),
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    })
    .done(function() {
      self.onRemoteSuccess(collection, doc);
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      if (jqXHR.readyState === 4 && jqXHR.responseJSON && jqXHR.responseJSON.error) {
        // HTTP error (can be checked by jqXHR.status and jqXHR.statusText)
        self.submitErrors[collection][doc.id] = jqXHR.responseJSON.error; // eslint-disable-line security/detect-object-injection
        log.error("Unable to synchronize  '" + doc.id + "'. Request Failed with error : " + jqXHR.responseJSON.error );
      } else {
        // something weird is happening
        log.error("Unable to synchronize  '" + doc.id + "'. Request Failed with status : " + textStatus, jqXHR );
      }
      if (errorThrown) { log.error(errorThrown); }
    });
  }

  // Deletes the doc remotly
  deleteLocalDocument(collection, doc) {
    let self = this;
    return jQuery.ajax({
      url: this.getRestUrl(collection) + doc.id,
      type: "DELETE",
      data: JSON.stringify(doc), // required (matadata.timestamp)
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    })
    .done(function() {
      self.onRemoteSuccess(collection, doc);
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
      if (jqXHR.readyState === 4 && jqXHR.responseJSON && jqXHR.responseJSON.error) {
        // HTTP error (can be checked by jqXHR.status and jqXHR.statusText)
        self.submitErrors[collection][doc.id] = jqXHR.responseJSON.error; // eslint-disable-line security/detect-object-injection
        log.error("Unable to synchronize  '" + doc.id + "'. Request Failed with error : " + jqXHR.responseJSON.error );
      } else {
        // something weird is happening
        log.error("Unable to synchronize  '" + doc.id + "'. Request Failed with status : " + textStatus, jqXHR );
      }
      if (errorThrown) { log.error(errorThrown); }
    });
  }

  // Get the collection remotly
  // TODO: Don't use "feature" here but "doc" (move to AncgisIdbManager ?)
  populateFeaturesCollection (collection) {
    let self = this;
    self.getRemoteDocuments(collection)
    .then(function(data, statusText, xhrObj) {
      // Add the data to the db
      var objectStore = self.db.transaction(collection, "readwrite").objectStore(collection);
      data.features.forEach(function(feature) {
        objectStore.add(feature);
      });
    }, function(xhrObj, textStatus, err) { // Catch the JQuery error
      // TODO: Delete the db ?
      log.error(err);
    })
    .catch(function(err) { // Catch the success function error
      // TODO: Delete the db ?
      log.error(err);
    });
  }

  async readAll(collection) {
    let geoJsonFeatures = await super.readAll(collection);
    let cleanedGeoJsonFeatures = [];
    geoJsonFeatures.forEach(function(gjFeature){ // eslint-disable-line complexity
      if (!(gjFeature.properties && gjFeature.properties.metadata && gjFeature.properties.metadata.deleted)) {
        // The features must stay metadata free
        if (gjFeature.properties && gjFeature.properties.metadata) {
          delete gjFeature.properties.metadata;
        }
        cleanedGeoJsonFeatures.push(gjFeature);
      }
    });
    return cleanedGeoJsonFeatures;
  }

  create(collection, doc) {
    doc.properties.metadata = {
      "timestamp": Date.now(),
      "dirty": 1,
      "local": 1
    };
    return super.create(collection, doc);
    // Note:
    // We are not trying remote synchronization now as this requires doing it
    // in the current indexdb transaction. We can not block the database pending
    // the resolution of the ajax request.
  }

  onRemoteSuccess(collection, gjdoc) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let store = self.db.transaction([collection], "readwrite").objectStore(collection);
      // Gets the document from local database
      let getRequest = store.get(gjdoc.id);
      getRequest.onsuccess = function(event) {
        let request, doc = event.target.result;
        // The document was not modified during the upload process
        if (gjdoc.properties.metadata.timestamp === doc.properties.metadata.timestamp) {
          delete doc.properties.metadata.dirty;
          delete doc.properties.metadata.local;
          if (doc.properties.metadata.deleted) {
            request = store.delete(doc.id);
          } else {
            request = store.put(doc);
          }
        }
        // The document was modified during the upload process
        else {
          delete doc.properties.metadata.local; // The document was synchronized
          request = store.put(doc);
        }
        request.onsuccess = function(event) {
          log.debug("'" + doc.id + "' has been cleaned in your local database.");
          resolve(doc);
        };
        request.onerror = function(event) {
          reject(Error("Unable to clean '" + doc.id + "' into the local database."));
        };
      };
    });
  }

  update(collection, gjdoc) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let store = self.db.transaction([collection], "readwrite").objectStore(collection);
      let getRequest = store.get(gjdoc.id);
      getRequest.onsuccess = function(event) {
        let doc = event.target.result;
        gjdoc.properties.metadata = doc.properties.metadata;
        gjdoc.properties.metadata.timestamp = Date.now();
        gjdoc.properties.metadata.dirty = 1;
        let putRequest = store.put(gjdoc);
        putRequest.onsuccess = function(event) {
          log.debug("'" + doc.id + "' has been updated in your local database.");
          self.dispatchUpdateEvent(collection, doc);
          resolve(doc);
        };
        putRequest.onerror = function(event) {
          reject(Error("Unable to update '" + doc.id + "' into the local database."));
        };
      };
    });
    // Notes:
    // - We don't use the super.read() and super.update()
    // to do the job into the same transaction.
    // - We are not trying remote synchronization now as this requires doing it
    // in the current indexdb transaction. We can not block the database pending
    // the resolution of the ajax request.
  }

  async delete(collection, id) {
    let doc = await super.read(collection, id);
    if (doc.properties.metadata.local) {
      return super.delete(collection, id);
    } else {
      doc.properties.metadata.timestamp = Date.now();
      doc.properties.metadata.dirty = 1;
      doc.properties.metadata.deleted = 1;
      return super.update(collection, doc);
    }
    // Note:
    // We are not trying remote synchronization now as this requires doing it
    // in the current indexdb transaction. We can not block the database pending
    // the resolution of the ajax request.
  }

  uptadeLocalFeature(objectStore, rfeature) {
    let updateType;
    return new Promise(async function(resolve, reject) {
      let getLocalFeatureRequest = objectStore.get(rfeature.id);
      getLocalFeatureRequest.onsuccess = function(event) {
        let lFeature = getLocalFeatureRequest.result;
        // Case 1: The feature is present into the local database
        if (lFeature) {
          // Case 1.1: The remote is newer
          if (rfeature.properties.metadata.timestamp > lFeature.properties.metadata.timestamp) {
            // Case 1.1.1: The remote was deleted
            if (rfeature.properties.metadata.deleted) {
              objectStore.delete(rfeature.id);
              updateType = "deleted";
            }
            // Case 1.1.2: The remote was updated
            else {
              // Case 1.1.2.1: The local was not modified
              if (!lFeature.properties.metadata.dirty) {
                // The local is replaced
                objectStore.put(rfeature);
                updateType = "updated";
              }
              // Case 1.1.2.2: The local was modified
              else {
                // The local is replaced
                // TODO: Do better (conflict manager).
                objectStore.put(rfeature);
                updateType = "updated";
              }
            }
          }
        }
        // Case 2: The feature is not present into the local database
        else {
          objectStore.add(rfeature);
          updateType = "added";
        }
        resolve(updateType);
      };
      getLocalFeatureRequest.onerror = function(event) {
        reject(Error("Unable to retrieve data from database."));
      };
    });
  }

  // TODO: Don't use "feature" here but "doc"
  downloadFeatures(collection) {
    let self = this;
    return new Promise(async function(resolve, reject) {
      self.getRemoteDocuments(collection).done( function(featureCollection) {
        let objectStore = self.db.transaction(collection, "readwrite").objectStore(collection);
        let count = { added: 0, updated: 0, deleted: 0 };
        let promises = [];
        featureCollection.features.forEach(function(rfeature) {
          promises.push(self.uptadeLocalFeature(objectStore, rfeature));
        });
        Promise.all(promises).then(function(results){
          results.forEach(function(result) {
            switch(result){
              case "added": count.added++; break;
              case "updated": count.updated++; break;
              case "deleted": count.deleted++; break;
            };
          });
          resolve(count);
        }, function(e){
          reject(e);
        })
        .catch(function(){
          reject(Error("Unable to retrieve data from database."));
        });
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
          if (jqXHR.readyState === 0) {
            // Network error (i.e. connection refused, access denied due to CORS, etc.)
            displayMapMessage("La demande de récupération des données a echouée suite à une erreur réseau.", "error", true);
          } else if (jqXHR.readyState === 4) {
            // HTTP error (can be checked by jqXHR.status and jqXHR.statusText)
            displayMapMessage("La demande de récupération des données a echouée suite à une erreur HTTP.", "error", true);
          } else {
            // something weird is happening
            displayMapMessage("La demande de récupération des données a echouée suite à une erreur inconnue.", "error", true);
          }
          log.error( "Request Failed with status : " + textStatus );
          if (errorThrown) { log.error(errorThrown); }
          reject(Error("Unable to get remote documents from server."));
      });
    });
  }

  getDirtyDocuments(collection) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let data = [];
      let objectStore = self.db.transaction(collection).objectStore(collection);
      let index = objectStore.index("dirty");
      let singleKeyRange = IDBKeyRange.only(1); // dirty = 1
      index.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          data.push(cursor.value);
          cursor.continue();
        }
        else {
           // No more entries
           resolve(data);
        }
      };
    });
  }

  getDirtyDocumentsCount(collection) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let count = 0;
      let objectStore = self.db.transaction(collection).objectStore(collection);
      let index = objectStore.index("dirty");
      let singleKeyRange = IDBKeyRange.only(1); // dirty = 1
      index.openCursor(singleKeyRange).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          count++;
          cursor.continue();
        }
        else {
           // No more entries
           resolve(count);
        }
      };
    });
  }

  async uploadFeatures(collection) {
    let self = this;
    self.submitErrors[collection] = {};  // eslint-disable-line security/detect-object-injection
    return new Promise(async function(resolve, reject) {
      let geoJsonFeatures = await self.getDirtyDocuments(collection);
      let count = {
        added: 0,
        updated: 0,
        deleted: 0
      };
      if (geoJsonFeatures.length === 0) {
        resolve(count);
      } else {
        let uploadPromises = [];
        geoJsonFeatures.forEach( function(gjFeature) {
          if (gjFeature.properties.metadata.local) {
            uploadPromises.push(self.postLocalDocument(collection, gjFeature));
            count.added++;
          } else if (gjFeature.properties.metadata.deleted) {
            uploadPromises.push(self.deleteLocalDocument(collection, gjFeature));
            count.deleted++;
          } else {
            uploadPromises.push(self.putLocalDocument(collection, gjFeature));
            count.updated++;
          }
        });
        Promise.all(uploadPromises).then(function(){
          resolve(count);
        }).catch(function(){
          reject({
            "error": Error("Unable to upload the documents to the server."),
            "details": self.submitErrors[collection] // eslint-disable-line security/detect-object-injection
          });
        });
      }
    });
  }

  onCreateEvent(e) {}
}

export default SyncIdbManager;
