/**
 * Zone's data access object.
 */
module.exports = (function() {

  this.url = '/rest/vegetation-zones/';

  // Update the zone's properties
  this.updateFeature = function (feature, newPpts) {

    // Update the feature locally
    if (newPpts) {
      feature.setProperties(newPpts);
    }

    // Setup the geojsonPpts var
    var ppts = feature.getProperties();
    var geojsonPpts = {
      type : ppts.type,
      flore : ppts.flore.map(function(obj) {
          return { taxon: obj.taxon.id, recovery: obj.recovery };
      }),
    };

    // Update the feature remotly
    const featureId = feature.getId();
    let type, data, updateURL = this.url;
    const format = new ol.format.GeoJSON();
    if (!featureId) { // Create
      type = 'POST';
      data = {
        type: "Feature",
        properties: geojsonPpts,
        geometry: format.writeGeometryObject(ppts.geometry)
      };
    } else { // Update
      updateURL += featureId;
      type = 'PUT';
      data = {
        properties: geojsonPpts,
        geometry: format.writeGeometryObject(ppts.geometry)
      };
    }
    jQuery.ajax({ // TODO: use promise
      url: updateURL,
      type: type,
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(response) {
        if (response.status === 'success') {
          // TODO: Save locally into indexDB (sync = true)
          $('#anc-zoneform').remove();
        } else {
          // TODO: Display an error message
          // TODO: Save locally into indexDB (sync = false)
          // TODO: Make the synchronization with a web worker.
        }
      }
      // TODO: Catch the error
    });
  };

  // Remove the zone
  this.removeFeature = function (feature) {
    jQuery.ajax({ // TODO: use promise
      url: this.url + feature.getId(),
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        if (response.status === 'success') {
          // TODO: Save locally into indexDB (sync = true)
          // TODO: Add a confirmation message popup
        } else {
          // TODO: Display an error message
          // TODO: Save locally into indexDB (sync = false)
          // TODO: Make the synchronization with a web worker.
        }
      }
      // TODO: Catch the error
    });
  };

  return this;
})();
