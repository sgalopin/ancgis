/**
 * Abstract data access object.
 */
module.exports = (function() {

  var zoneDAO = require('./zone');
  var hiveDAO = require('./hive');

  return {
    // Update function
    updateFeature: function (feature) {
      switch (feature.get('featureType')) {
        case anc.sig.const.featureType.ZONE:
          zoneDAO.updateFeature(feature);
          break;
        case anc.sig.const.featureType.HIVE:
          hiveDAO.updateFeature(feature);
          break;
        default:
          console.error('Unknow feature type.')
      }
    },

    // Remove function
    removeFeature: function (feature) {
      switch (feature.get('featureType')) {
        case anc.sig.const.featureType.ZONE:
          zoneDAO.removeFeature(feature);
          break;
        case anc.sig.const.featureType.HIVE:
          hiveDAO.removeFeature(feature);
          break;
        default:
          console.error('Unknow feature type.')
      }
    }
  }
})();
