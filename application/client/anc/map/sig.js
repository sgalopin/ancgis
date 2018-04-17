/**
 * Sig builder.
 */
module.exports = (function() {
	var map = require('./map');
	var zoneDAO = require('../dao/zone');
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
		// Translate Button Control
		translate : new ol.interaction.Translate(),
		// Modify Button Control
		modify : new ol.interaction.ModifyFeature({
			source: map.getLayerByName('vegetationsLayer').getSource()
		}),
		// Erase Button Control
		erase : new ol.interaction.RemoveFeatures(),
    // Edit Zone Properties interaction
    editzoneproperties : new ol.interaction.EditZoneProperties({
			// TODO: remove the callback and add a listener
			callback: function(feature) {
				var buildForm = require('../form/zone');
				buildForm(feature);
			},
      zonesLayerName: 'vegetationsLayer'
    })
  };

	// Management of the interactions events
	interactions.translate.on(
		ol.interaction.TranslateEventType.TRANSLATEEND,
		function(evt){
			evt.features.forEach(function(feature){
				zoneDAO.updateFeature(feature);
			}, this);
		}
	);
	interactions.modify.on(
		ol.interaction.ModifyEventType.MODIFYFEATURES,
		function(evt){
			evt.features.forEach(function(feature){
				zoneDAO.updateFeature(feature);
			}, this);
		}
	);
	interactions.erase.on(
		ol.interaction.Select.EventType_.REMOVE,
		function(evt){
			evt.selected.forEach(function(feature){
				zoneDAO.removeFeature(feature);
			}, this);
		}
	);

	// Management of the toggling of the interactions
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
