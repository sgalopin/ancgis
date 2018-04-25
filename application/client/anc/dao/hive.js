/**
 * Hive's data access object.
 */
module.exports = (function() {

  return jQuery.extend({

    // Returns the url
    getUrl: function () {
      return '/rest/hives/';
    },

    // Returns the data
    getData: function (feature) {
      // Setup the geojsonPpts var
      var ppts = feature.getProperties();
      const format = new ol.format.GeoJSON();

      return {
        type: "Feature",
        properties: {
          registrationNumber : ppts.registrationNumber ?  ppts.registrationNumber : null,
          type : ppts.type ? ppts.type : null,
          framesCount : ppts.framesCount ? ppts.framesCount : null
        },
        geometry: format.writeGeometryObject(ppts.geometry)
      };
    }
  }, require('../dao/crud'));
  
})();
