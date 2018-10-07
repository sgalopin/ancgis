import IdbManager from "./IdbManager.js";

/**
 * @module ancgis/client/ancgis/dbms/SyncIdbManager
 */

/**
 * @classdesc
 * Manage the synchronization between the local and remote databases.
 *
 * @api
 */
class SyncIdbManager extends IdbManager {

  /**
   * @param {module:ancgis/client/ancgis/dbms/SyncIdbManager~Options=} opt_options Options.
   */
  constructor(opt_options) {

    super();

    const options = opt_options ? opt_options : {};
    this.restBaseUrl = options.restBaseUrl ? options.restBaseUrl : "/rest";
  }

  // Open the database
  async openDB() {
    await super.openDB();
    console.log('dbm:', this);

    // Add listeners
    this.db.addEventListener('create', this.onCreateEvent.bind(this));

    return this;
  }

  getRestUrl(collection) {
    return this.restBaseUrl + "/" + collection + "/";
  }

  // Get the collection remotly
  populateFeaturesCollection (collectionName) {
    let self = this;
    jQuery.getJSON({
      url: "./rest/" + collectionName,
      dataType: "json"
    })
    .then(function(data, statusText, xhrObj) {
      // Add the data to the db
      var objectStore = self.db.transaction(collectionName, "readwrite").objectStore(collectionName);
      data.features.forEach(function(element) {
        element.metadata = {
          "timestamp": Date.now(), // TODO: get it from the server
          "synced": true,
          "local": false
        };
        objectStore.add(element);
        // TODO: if exist do a put not a add
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

  async readAll(collection) {
    let geoJsonFeatures = await super.readAll(collection);
    let cleanedGeoJsonFeatures = [];
    geoJsonFeatures.forEach(function(gjFeature){
      if (!(gjFeature.metadata && gjFeature.metadata.deleted === true)) {
        cleanedGeoJsonFeatures.push(gjFeature);
      }
    });
    return cleanedGeoJsonFeatures;
  }

  create(collection, doc) {
    doc.metadata = {
      "timestamp": Date.now(),
      "synced": false,
      "local": true
    };
    return super.create(collection, doc);
    // Note:
    // We are not trying remote synchronization now as this requires doing it
    // in the current indexdb transaction. We can not block the database pending
    // the resolution of the ajax request.
  }

  update(collection, doc) {
    doc.metadata.timestamp = Date.now();
    doc.metadata.synced = false;
    return super.update(collection, doc);
    // Note:
    // We are not trying remote synchronization now as this requires doing it
    // in the current indexdb transaction. We can not block the database pending
    // the resolution of the ajax request.
  }

  async delete(collection, id) {
    let doc = await super.read(collection, id);
    if (doc.metadata.local === true) {
      return super.delete(collection, id);
    } else {
      doc.metadata.timestamp = Date.now();
      doc.metadata.synced = false;
      doc.metadata.deleted = true;
      doc = {
        "id": id,
        "metadata": doc.metadata
      };
      return super.update(collection, doc);
    }
    // Note:
    // We are not trying remote synchronization now as this requires doing it
    // in the current indexdb transaction. We can not block the database pending
    // the resolution of the ajax request.
  }

  onCreateEvent(e) {}
}

export default (new SyncIdbManager()).openDB(); // Return a singleton