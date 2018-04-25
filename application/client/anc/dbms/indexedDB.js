/**
 * IndexedDB builder.
 */
module.exports = (function() { // eslint-disable-line complexity

	//prefixes of implementation that we want to test
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	//prefixes of window.IDB objects
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

	if (!window.indexedDB) {
		console.log("Your browser doesn't support a stable version of IndexedDB.")
	}

	var me = {};

	me.read = function (id) {
		return new Promise(function(resolve, reject) {
			var request = me.db.transaction(["taxons"])
			.objectStore("taxons")
			.get(id);
			request.onerror = function(event) {
			   console.error(Error("Unable to retrieve data from database."));
			};
			request.onsuccess = function(event) {
			   if (request.result) {
					 	resolve(request.result);
			   } else {
					  reject(Error("Data not found in your database."));
			   }
			};
		});
	};

	me.readAll = function () {
		return new Promise(function(resolve, reject) {
			var data = [];
			var objectStore = me.db.transaction("taxons").objectStore("taxons");
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
			}; // TODO: Add an 'onerror' handler ?
		});
	};

	me.add = function (obj) { // TODO: Return a promise.
		var request = this.db.transaction(["taxons"], "readwrite")
		.objectStore("taxons")
		.add(obj);

		request.onsuccess = function(event) {
		   console.log("'" + obj._id + "' has been added to your database.");
		};

		request.onerror = function(event) {
		   console.log("Unable to add data.");
		}
	};

	me.remove = function (id) { // TODO: Return a promise.
		var request = this.db.transaction(["taxons"], "readwrite")
		.objectStore("taxons")
		.delete(id);

		request.onsuccess = function(event) {
		   console.log("'" + id + "' entry has been removed from the database.");
		};
	};

	function addCollection (collectionName) {
		me.db.createObjectStore("taxons", {keyPath: "id"});
		// Get the collection
		jQuery.getJSON({
			url: "./rest/" + collectionName,
			dataType: 'json'
		})
		.then(function(data, statusText, xhrObj) {
			// Add the data to the db
			var objectStore = me.db.transaction(collectionName, "readwrite").objectStore(collectionName);
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

	// Open the database
	var request = window.indexedDB.open("ancDB", 1);
	request.onerror = function(event) {
		console.log("Error loading database.");
	};
	request.onupgradeneeded = function(event) {
		me.db = event.target.result;
		addCollection("taxons");
	}
	request.onsuccess = function(event) {
			me.db = event.target.result;
	};

	return me;
})();
