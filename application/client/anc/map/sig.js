/**
 * Sig builder.
 */
module.exports = (function() {
	var map = require('./map');
  var interactions = {
    // Add Hive Button Control
    addhive : new ol.interaction.AddHive({
      source: map.getLayerByName('hivesLayer').getSource()
    }),
    // Draw Polygon Button Control
    drawpolygon : new ol.interaction.Draw({
      source: map.getLayerByName('vegetationsLayer').getSource(),
      type: 'Polygon'
    }),
    // Draw Circle Button Control
    drawcircle : new ol.interaction.Draw({
      source: map.getLayerByName('vegetationsLayer').getSource(),
      type: 'Circle'
    }),
    // Edit Zone Properties interaction
    editzoneproperties : new ol.interaction.EditZoneProperties({
      callback: function(feature) {
				var buildForm = require('../form/zone');
				buildForm(feature);
			},
      zonesLayerName: 'vegetationsLayer'
    })
  };

  $('#anc-mapcontrol-tbar>button').click(function(){
    event.stopPropagation();
    $(this).toggleClass('active');
    if($(this).is('.active')){
      $('#anc-mapcontrol-tbar>button[id!="'+ $(this).attr('id') +'"]').trigger('controlChange');
      map.addInteraction(interactions[$(this)[0].dataset.shortid]);
      $('#anc-map').trigger('interactionAdded');
    } else {
      map.removeInteraction(interactions[$(this)[0].dataset.shortid]);
    }
  });
  $('#anc-mapcontrol-tbar>button').on('controlChange', function(event) {
    event.stopPropagation();
    if($(this).is('.active')){
      $(this).toggleClass('active');
      map.removeInteraction(interactions[$(this)[0].dataset.shortid]);
    }
  });
  // Keep the editzoneproperties on the top of the map's interactions
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); })
  map.addInteraction(interactions.editzoneproperties);
  $('#anc-map').on('interactionAdded', function(event) {
    event.stopPropagation();
    map.removeInteraction(interactions.editzoneproperties);
    map.addInteraction(interactions.editzoneproperties);
  });

  return {
		map: map,
		interactions: interactions
	}
})();
