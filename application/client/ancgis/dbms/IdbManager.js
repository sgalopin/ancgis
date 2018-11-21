/**
 * @module ancgis/client/ancgis/dbms/IdbManager
 */

if (!window.indexedDB) {
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
}
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  console.log("Your browser doesn't support a stable version of IndexedDB.");
}

/**
 * @classdesc
 * Manage the local indexDatabase.
 *
 * @api
 */
class IdbManager {

  /**
   * @param {module:ancgis/client/ancgis/dbms/IdbManager~options=} options Options.
   */
  constructor(options) {}

  // Open the database
  async openDB() {
    let self = this;
    return new Promise(function(resolve, reject) {
      let request = window.indexedDB.open("ancDB", 1);
      request.onerror = function(event) {
        reject(Error("Error loading database."));
      };
      request.onupgradeneeded = function(event) {
        self.db = event.target.result;
        self.db.createObjectStore("taxons", {keyPath: "id"});
        let hivesStore = self.db.createObjectStore("hives", {keyPath: "id"});
        hivesStore.createIndex("dirty", "properties.metadata.dirty");
        let zonesStore = self.db.createObjectStore("vegetation-zones", {keyPath: "id"});
        zonesStore.createIndex("dirty", "properties.metadata.dirty");
        let extentsStore = self.db.createObjectStore("extents", {keyPath: "id"});
        extentsStore.createIndex("dirty", "properties.metadata.dirty");
        // Returns the db
        event.target.transaction.oncomplete = function(e) {
          self.populateDataCollection("taxons"); // is Asynchrone
          resolve(self);
        };
      };
      request.onsuccess = function(event) {
          self.db = event.target.result;
          resolve(self);
      };
    });
  }

  getCollectionsNames () {
    const stringList = this.db.objectStoreNames; //DOMStringList
    let collectionsArray = [];
    for (let i = 0; i < stringList.length; i++){
      collectionsArray.push(stringList.item(i));
    }
    return collectionsArray;
  }

  // Get the collection remotly
  populateDataCollection (collectionName) {
    let self = this;
    jQuery.getJSON({
      url: "./rest/" + collectionName,
      dataType: "json"
    })
    .then(function(data, statusText, xhrObj) {
      // Add the data to the db
      var objectStore = self.db.transaction(collectionName, "readwrite").objectStore(collectionName);
      data.forEach(function(element) {
        objectStore.add(element);
      });
    }, function(xhrObj, textStatus, err) { // Catch the JQuery error
      // TODO: Delete the db ?
      console.log(err);
    })
    .catch(function(err) { // Catch the success function error
      // TODO: Delete the db ?
      console.log(err);
    });
  }

  create(collection, doc) {
    let self = this;
    return new Promise(function(resolve, reject) {
      let request = self.db.transaction([collection], "readwrite")
      .objectStore(collection)
      .add(doc);
      request.onsuccess = function(event) {
        console.debug("'" + doc.id + "' has been added to your local database.");
        self.dispatchCreateEvent(collection, doc);
        resolve(doc);
      };
      request.onerror = function(event) {
        reject(Error("Unable to add '" + doc.id + "' into the local database."));
      };
    });
  }

  read(collection, id) {
    let self = this;
    return new Promise(function(resolve, reject) {
      var request = self.db.transaction([collection])
      .objectStore(collection)
      .get(id);
      request.onsuccess = function(event) {
         if (request.result) {
             resolve(request.result);
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
    let self = this;
    return new Promise(function(resolve, reject) {
      var data = [];
      var objectStore = self.db.transaction(collection).objectStore(collection);
      objectStore.openCursor().onsuccess = function(event) {
         var cursor = event.target.result;
         if (cursor) {
            data.push(cursor.value);
            cursor.continue();
         }
         else {
            // No more entries
            resolve(data);
         }
      }; // TODO: Add an "onerror" handler ?
    });
  }

  update(collection, doc, dispatchEvent = true) {
    let self = this;
    return new Promise(function(resolve, reject) {
      var request = self.db.transaction([collection], "readwrite")
      .objectStore(collection)
      .put(doc);
      request.onsuccess = function(event) {
        console.debug("'" + doc.id + "' has been updated in your local database.");
        if (dispatchEvent) {
          self.dispatchUpdateEvent(collection, doc);
        }
        resolve(doc);
      };
      request.onerror = function(event) {
        reject(Error("Unable to add '" + doc.id + "' into the local database."));
      };
    });
  }

  delete(collection, id) {
    let self = this;
    return new Promise(function(resolve, reject) {
      var request = self.db.transaction([collection], "readwrite")
      .objectStore(collection)
      .delete(id);
      request.onsuccess = function(event) {
        console.log("'" + id + "' entry has been removed from the database.");
        self.dispatchDeleteEvent(collection, id);
        resolve(id);
      };
      request.onerror = function(event) {
        reject(Error("Unable to remove '" + id + "'."));
      };
    });
  }

  dispatchCreateEvent(collection, doc) {
    this.db.dispatchEvent(new CustomEvent("create", {
      "detail": {
        collection,
        "document": doc
      }
    }));
  }

  dispatchUpdateEvent(collection, doc) {
    this.db.dispatchEvent(new CustomEvent("update", {
      "detail": {
        collection,
        "document": doc
      }
    }));
  }

  dispatchDeleteEvent(collection, doc) {
    this.db.dispatchEvent(new CustomEvent("delete", {
      "detail": {
        "collection": collection,
        "document": doc
      }
    }));
  }
}

export default IdbManager;