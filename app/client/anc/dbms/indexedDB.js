/**
 * IndexedDB builder.
 */
module.exports = (function() {

	//prefixes of implementation that we want to test
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	//prefixes of window.IDB objects
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

	if (!window.indexedDB) {
		console.log("Your browser doesn't support a stable version of IndexedDB.")
	}

	const taxonData = JSON.parse($.getJSON({'url': "./json/taxon.json", 'async': false}).responseText);

	// Open the database
	var request = window.indexedDB.open("ancDB", 1);

	request.onerror = function(event) {
		console.log("Error loading database.");
	};

	var me = {

		read : function (id) {
			var transaction = this.db.transaction(["taxon"]);
			var objectStore = transaction.objectStore("taxon");
			var request = objectStore.get(id);

			request.onerror = function(event) {
			   console.log("Unable to retrieve data from database.");
			};

			request.onsuccess = function(event) {
			   if(request.result) {
			      console.log(request.result.taxon + ", " + request.result.vernacularName);
			   }
			   else {
			      console.log("Data not found in your database.");
			   }
			};
		},

		readAll : function () {
			var objectStore = this.db.transaction("taxon").objectStore("taxon");

			objectStore.openCursor().onsuccess = function(event) {
			   var cursor = event.target.result;
			   if (cursor) {
			      console.log(cursor.key + ", " + cursor.value.vernacularName);
			      cursor.continue();
			   }
			   else {
			      console.log("No more entries!");
			   }
			};
		},

		add : function (obj) {
			var request = this.db.transaction(["taxon"], "readwrite")
			.objectStore("taxon")
			.add(obj);

			request.onsuccess = function(event) {
			   console.log("'" + obj.taxon + "' has been added to your database.");
			};

			request.onerror = function(event) {
			   console.log("Unable to add data.");
			}
		},

		remove : function (id) {
			var request = this.db.transaction(["taxon"], "readwrite")
			.objectStore("taxon")
			.delete(id);

			request.onsuccess = function(event) {
			   console.log("'" + id + "' entry has been removed from the database.");
			};
		}
	};

	request.onupgradeneeded = function(event) {
		me.db = event.target.result;
		var objectStore = me.db.createObjectStore("taxon", {keyPath: "taxon"});

		for (var i in taxonData) {
			 objectStore.add(taxonData[i]);
		}
	}

	request.onsuccess = function(event) {
			me.db = event.target.result;
	};

	return me;
})();
