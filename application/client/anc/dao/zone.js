/*global ol*/
/**
 * Zone's data access object.
 */
module.exports = (function() {

  return jQuery.extend({

    // Returns the url
    getUrl: function () {
      return '/rest/vegetation-zones/';
    },

    // Returns the data
    getData: function (feature) {
      // Setup the geojsonPpts var
      var ppts = feature.getProperties();
      const format = new ol.format.GeoJSON();

      return {
        type: "Feature",
        properties: {
          type : ppts.type ? ppts.type : null,
          flore : ppts.flore ? ppts.flore.map(function(obj) {
              return { taxon: obj.taxon.id, recovery: obj.recovery };
          }) : []
        },
        geometry: format.writeGeometryObject(ppts.geometry)
      };
    }
  }, require('../dao/crud'));

})();
