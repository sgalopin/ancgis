/*global ol*/

// ol import
import 'ol/ol.css'
import Draw from 'ol/interaction/Draw.js'
import Translate from 'ol/interaction/Translate.js'

// local import
import EditPropertiesEventType from '../../ol/interaction/EditPropertiesEventType.js'
import ModifyFeatureEventType from '../../ol/interaction/ModifyFeatureEventType.js'
import RemoveFeaturesEventType from '../../ol/interaction/RemoveFeaturesEventType.js'
import AddHive from '../../ol/interaction/AddHive.js'
import ModifyFeature from '../../ol/interaction/ModifyFeature.js'
import RemoveFeatures from '../../ol/interaction/RemoveFeatures.js'
import EditProperties from '../../ol/interaction/EditProperties.js'
import Map from './map.js'

// Copied from ol/interaction/Translate.js
const TRANSLATEEND = 'translateend';

/**
 * Sig builder.
 */
export default async function() {

  let map = await Map();

  var interactions = {
    // Add Hive Button Control
    addhive : new AddHive({
      source: map.getLayerByName("hivesLayer").getSource()
    }),
    // Draw Polygon Button Control
    drawpolygon : new Draw({
      source: map.getLayerByName("vegetationsLayer").getSource(),
      type: "Polygon"
    }),
    // Draw Circle Button Control
    drawcircle : new Draw({
      source: map.getLayerByName("vegetationsLayer").getSource(),
      type: "Circle"
    }),
		// Translate Button Control
		translate : new Translate(),
		// Modify Button Control
		modify : new ModifyFeature({
			source: map.getLayerByName("vegetationsLayer").getSource()
		}),
		// Erase Button Control
		erase : new RemoveFeatures(),
    // Edit Zone Properties interaction
		editproperties : new EditProperties()
  };

	// Management of the interactions events
	interactions.translate.on(
		TRANSLATEEND,
		function(e){
			e.features.forEach(function(feature){
				feature.getProperties().dao.updateFeature(feature);
			}, this);
		}
	);
	interactions.modify.on(
		ModifyFeatureEventType.MODIFYFEATURES,
		function(e){
			e.features.forEach(function(feature){
				feature.getProperties().dao.updateFeature(feature);
			}, this);
		}
	);
	interactions.erase.on(
		RemoveFeaturesEventType.REMOVE,
		function(e){
			e.selected.forEach(function(feature){
				feature.getProperties().dao.deleteFeature(feature);
			}, this);
		}
	);
	interactions.editproperties.on(
		EditPropertiesEventType.SELECT,
		function(e){
			e.feature.getProperties().form.show(map, e.feature);
		}
	);

	// Management of the toggling of the interactions
  $("#ancgis-mapcontrol-tbar>button").click(function(){
    event.stopPropagation();
    $(this).toggleClass("active");
    if($(this).is(".active")){
      $("#ancgis-mapcontrol-tbar>button[id!=\""+ $(this).attr("id") +"\"]").trigger("controlChange");
      map.addInteraction(interactions[$(this)[0].dataset.shortid]);
      $("#ancgis-map").trigger("interactionAdded");
    } else {
      map.removeInteraction(interactions[$(this)[0].dataset.shortid]);
    }
  });
  $("#ancgis-mapcontrol-tbar>button").on("controlChange", function(event) {
    event.stopPropagation();
    if($(this).is(".active")){
      $(this).toggleClass("active");
      map.removeInteraction(interactions[$(this)[0].dataset.shortid]);
    }
  });
  // Keep the editproperties on the top of the map's interactions
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  map.addInteraction(interactions.editproperties);
  $("#ancgis-map").on("interactionAdded", function(event) {
    event.stopPropagation();
    map.removeInteraction(interactions.editproperties);
    map.addInteraction(interactions.editproperties);
  });

  return { map, interactions };
};
