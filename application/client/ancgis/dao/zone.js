/*global ol*/

import ExtendedGeoJSON from '../../ol/format/ExtendedGeoJSON.js'

/**
 * Zone"s data access object.
 */
module.exports = (function() {

  return jQuery.extend({

    // Returns the url
    getUrl() {
      return "/rest/vegetation-zones/";
    },

    // Returns the data
    getData(feature) {
      // Setup the geojsonPpts var
      var ppts = feature.getProperties();
      const format = new ExtendedGeoJSON();

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
  }, require("../dao/crud"));

}());
