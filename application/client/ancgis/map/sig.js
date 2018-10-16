/*global ol*/

// ol import
import 'ol/ol.css'
import Draw from 'ol/interaction/Draw.js'
import Translate from 'ol/interaction/Translate.js'
import VectorEventType from 'ol/source/VectorEventType.js'

// local import
import EditPropertiesEventType from '../../ol/interaction/EditPropertiesEventType.js'
import ModifyFeatureEventType from '../../ol/interaction/ModifyFeatureEventType.js'
import RemoveFeaturesEventType from '../../ol/interaction/RemoveFeaturesEventType.js'
import AddHive from '../../ol/interaction/AddHive.js'
import ModifyFeature from '../../ol/interaction/ModifyFeature.js'
import RemoveFeatures from '../../ol/interaction/RemoveFeatures.js'
import EditProperties from '../../ol/interaction/EditProperties.js'
import Map, {featuresToGeoJson} from './map.js'
import Idbm from "../dbms/AncgisIdbManager.js"
import {displayMapMessage} from "../tool/message.js";
import ZoneDAO from "../dao/ZoneDAO.js";
import HiveDAO from "../dao/HiveDAO.js";
import ZoneForm from "../form/zone.js";
import HiveForm from "../form/hive.js";
import syncInfoTemplate from "../../../views/partials/sync-info.hbs";

// Copied from ol/interaction/Translate.js
const TRANSLATEEND = 'translateend';

/**
 * Sig builder.
 */
export default async function() {

  let idbm = await (new Idbm()).openDB();
  let zoneDAO = new ZoneDAO(idbm);
  let hiveDAO = new HiveDAO(idbm);
  let zoneForm = await ZoneForm(idbm);
  let hiveForm = await HiveForm();
  const hivesLayerName = "hivesLayer";
  const vegetationsLayerName = "vegetationsLayer";
  let map = await Map(hivesLayerName, vegetationsLayerName);

  // Set up the hives layer source
  let hivesLayerSource = map.getLayerByName(hivesLayerName).getSource();
  // Set the default values and save the new hive
  hivesLayerSource.on(VectorEventType.ADDFEATURE, function(e){
    e.feature.setProperties({
      layerName: hivesLayerName,
      dao: hiveDAO,
      form: hiveForm
    }, true);
    if ( typeof e.feature.getId() === "undefined" ) {
      hiveDAO.createFeature(e.feature);
    }
  });
  // Add the features from the local database
  hivesLayerSource.addFeatures(await hiveDAO.featuresToGeoJson());

  // Set up the vegetations layer source
  let vegetationsLayerSource = map.getLayerByName(vegetationsLayerName).getSource();
  // Set the default values and save the new zone
  vegetationsLayerSource.on(VectorEventType.ADDFEATURE, function(e){
    e.feature.setProperties({
      layerName: vegetationsLayerName,
      dao: zoneDAO,
      form: zoneForm
    }, true);
    if ( typeof e.feature.getId() === "undefined" ) {
      zoneDAO.createFeature(e.feature); // Note: Raise the dispatching of the CHANGEFEATURE event
    } else {
      // Initialize the histogram
      map.dispatchPeriodPotentialChangeEvent();
    }
    // Note: The PeriodPotentialChangeEvent is also dispatched after the zone form validation.
  });
  vegetationsLayerSource.on(VectorEventType.REMOVEFEATURE, function(e){
    map.dispatchPeriodPotentialChangeEvent();
  });
  vegetationsLayerSource.on(VectorEventType.CHANGEFEATURE, function(e){
    map.dispatchPeriodPotentialChangeEvent();
  });
  // Add the features from the local database
  vegetationsLayerSource.addFeatures(await zoneDAO.featuresToGeoJson());

  var interactions = {
    // Add Hive Button Control
    addhive : new AddHive({
      source: map.getLayerByName(hivesLayerName).getSource()
    }),
    // Draw Polygon Button Control
    drawpolygon : new Draw({
      source: map.getLayerByName(vegetationsLayerName).getSource(),
      type: "Polygon"
    }),
    // Draw Circle Button Control
    drawcircle : new Draw({
      source: map.getLayerByName(vegetationsLayerName).getSource(),
      type: "Circle"
    }),
		// Translate Button Control
		translate : new Translate(),
		// Modify Button Control
		modify : new ModifyFeature({
			source: map.getLayerByName(vegetationsLayerName).getSource()
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

  // Management of the download button
  $("#ancgis-topright-download").click(async function() {
    if ( !navigator.onLine ) {
      displayMapMessage("La récupération des données requiert une connexion.", 'error', true);
    } else {
      const count = {
        hives: await hiveDAO.downloadFeatures(),
        zones: await zoneDAO.downloadFeatures()
      }
      hivesLayerSource.clear(true);
      vegetationsLayerSource.clear(true);
      hivesLayerSource.addFeatures(await hiveDAO.featuresToGeoJson());
      vegetationsLayerSource.addFeatures(await zoneDAO.featuresToGeoJson());
      const msg = "<b>Récupération des ruches :</b> <b>" + count.hives.added + "</b> ruche(s) ajoutée(s), <b>" + count.hives.updated + "</b> mise(s) à jour, <b>" + count.hives.deleted + "</b> effacée(s)."
      + "</br><b>Récupération des zones de végétation :</b> <b>" + count.zones.added + "</b> zone(s) ajoutée(s), <b>" + count.zones.updated + "</b> mise(s) à jour, <b>" + count.zones.deleted + "</b> effacée(s).";
      displayMapMessage(msg, "success", true);
    }
  });

  // Management of the upload button
  $("#ancgis-topright-upload").click(async function() {
    if ( !navigator.onLine ) {
      displayMapMessage("La soumission des données requiert une connexion.", "error", true);
    } else {
      const count = {
        hives: await hiveDAO.uploadFeatures(),
        zones: await zoneDAO.uploadFeatures()
      }
      const msg = "<b>Soumission des ruches :</b> <b>" + count.hives.added + "</b> ruche(s) ajoutée(s), <b>" + count.hives.updated + "</b> mise(s) à jour, <b>" + count.hives.deleted + "</b> effacée(s)."
      + "</br><b>Soumission des zones de végétation :</b> <b>" + count.zones.added + "</b> zone(s) ajoutée(s), <b>" + count.zones.updated + "</b> mise(s) à jour, <b>" + count.zones.deleted + "</b> effacée(s).";
      displayMapMessage(msg, "success", true);
      await sleep(2000); // TODO: To remove when the download will be done at once
      updateSyncInfo();
    }
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Management of the SyncInfo toolbar
  async function updateSyncInfo() {
    let count = await zoneDAO.getDirtyDocumentsCount();
    count += await hiveDAO.getDirtyDocumentsCount();
    let syncInfoHtml = syncInfoTemplate({count: count});
    $("#ancgis-syncinfo-tbar .content").remove();
    $("#ancgis-syncinfo-tbar").append(syncInfoHtml);
    // Tooltip activation
    $("[data-toggle=\"tooltip\"]").tooltip({
      trigger : 'hover'
    });
  }
  zoneDAO.addEventListener('dirtyAdded', updateSyncInfo);
  hiveDAO.addEventListener('dirtyAdded', updateSyncInfo);
  updateSyncInfo(); // Initialization

  return { map, interactions };
};
