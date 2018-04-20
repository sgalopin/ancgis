/**
 * Zone's data access object.
 */
module.exports = (function() {

  var url = '/rest/hives/';

  return {

    // Update the zone's properties
    updateFeature: function (feature) {

      // Setup the geojsonPpts var
      var ppts = feature.getProperties();
      var geojsonPpts = {
        registrationNumber : ppts.registrationNumber ?  ppts.registrationNumber : null,
        type : ppts.type ? ppts.type : null,
        framesCount : ppts.framesCount ? ppts.framesCount : null
      };

      // Update the feature remotly
      const featureId = feature.getId();
      let type, data, updateURL = url;
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
            if (!featureId) {
              feature.setId(response.data.id);
            }
            // TODO: Save locally into indexDB (sync = true)
            $('#anc-hiveform').remove(); // TODO: Don't do this here
          } else {
            // TODO: Display an error message
            // TODO: Save locally into indexDB (sync = false)
            // TODO: Make the synchronization with a web worker.
          }
        }
        // TODO: Catch the error
      });
    },

    // Remove the zone
    removeFeature: function (feature) {
      const featureId = feature.getId();
      if (featureId) {
        jQuery.ajax({ // TODO: use promise
          url: url + featureId,
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
      }
    }
  }
})();
