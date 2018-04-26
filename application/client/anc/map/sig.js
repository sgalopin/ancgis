/*global ol*/
/**
 * Sig builder.
 */
module.exports = (function() {
	var map = require("./map");
  var interactions = {
    // Add Hive Button Control
    addhive : new ol.interaction.AddHive({
      source: map.getLayerByName("hivesLayer").getSource()
    }),
    // Draw Polygon Button Control
    drawpolygon : new ol.interaction.Draw({
      source: map.getLayerByName("vegetationsLayer").getSource(),
      type: "Polygon"
    }),
    // Draw Circle Button Control
    drawcircle : new ol.interaction.Draw({
      source: map.getLayerByName("vegetationsLayer").getSource(),
      type: "Circle"
    }),
		// Translate Button Control
		translate : new ol.interaction.Translate(),
		// Modify Button Control
		modify : new ol.interaction.ModifyFeature({
			source: map.getLayerByName("vegetationsLayer").getSource()
		}),
		// Erase Button Control
		erase : new ol.interaction.RemoveFeatures(),
    // Edit Zone Properties interaction
		editproperties : new ol.interaction.EditProperties()
  };

	// Management of the interactions events
	interactions.translate.on(
		ol.interaction.TranslateEventType.TRANSLATEEND,
		function(e){
			e.features.forEach(function(feature){
				feature.getProperties().dao.updateFeature(feature);
			}, this);
		}
	);
	interactions.modify.on(
		ol.interaction.ModifyEventType.MODIFYFEATURES,
		function(e){
			e.features.forEach(function(feature){
				feature.getProperties().dao.updateFeature(feature);
			}, this);
		}
	);
	interactions.erase.on(
		ol.interaction.Select.EventType_.REMOVE,
		function(e){
			e.selected.forEach(function(feature){
				feature.getProperties().dao.removeFeature(feature);
			}, this);
		}
	);
	interactions.editproperties.on(
		ol.interaction.EditProperties.EventType.SELECT,
		function(e){
			e.feature.getProperties().form.show(e.feature);
		}
	);

	// Management of the toggling of the interactions
  $("#anc-mapcontrol-tbar>button").click(function(){
    event.stopPropagation();
    $(this).toggleClass("active");
    if($(this).is(".active")){
      $("#anc-mapcontrol-tbar>button[id!=\""+ $(this).attr("id") +"\"]").trigger("controlChange");
      map.addInteraction(interactions[$(this)[0].dataset.shortid]);
      $("#anc-map").trigger("interactionAdded");
    } else {
      map.removeInteraction(interactions[$(this)[0].dataset.shortid]);
    }
  });
  $("#anc-mapcontrol-tbar>button").on("controlChange", function(event) {
    event.stopPropagation();
    if($(this).is(".active")){
      $(this).toggleClass("active");
      map.removeInteraction(interactions[$(this)[0].dataset.shortid]);
    }
  });
  // Keep the editproperties on the top of the map's interactions
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  map.addInteraction(interactions.editproperties);
  $("#anc-map").on("interactionAdded", function(event) {
    event.stopPropagation();
    map.removeInteraction(interactions.editproperties);
    map.addInteraction(interactions.editproperties);
  });

  return { map, interactions };
}());
