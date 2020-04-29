/**
 * AncGIS - Web GIS for the analysis of honey resources around an apiary
 * Copyright (C) 2020  Sylvain Galopin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/*global ol*/

// ol import
import "ol/ol.css";
import Draw from "ol/interaction/Draw.js";
import Translate from "ol/interaction/Translate.js";
import VectorEventType from "ol/source/VectorEventType.js";
import Collection from "ol/Collection.js";
import {extend as olExtentExtend} from "ol/extent.js";

// local import
import EditPropertiesEventType from "../../ol/interaction/EditPropertiesEventType.js";
import ModifyFeatureEventType from "../../ol/interaction/ModifyFeatureEventType.js";
import RemoveFeaturesEventType from "../../ol/interaction/RemoveFeaturesEventType.js";
import AddHive from "../../ol/interaction/AddHive.js";
import ModifyFeature from "../../ol/interaction/ModifyFeature.js";
import RemoveFeatures from "../../ol/interaction/RemoveFeatures.js";
import EditProperties from "../../ol/interaction/EditProperties.js";
import getMap from "./map.js";
import Idbm from "../dbms/AncgisIdbManager.js";
import {displayMapMessage} from "../tool/message.js";
import ZoneDAO from "../dao/ZoneDAO.js";
import HiveDAO from "../dao/HiveDAO.js";
import ExtentDAO from "../dao/ExtentDAO.js";
import getZoneForm from "../form/zone.js";
import getHiveForm from "../form/hive.js";
import syncInfoTemplate from "../../../views/partials/sync-info.hbs";
import mapCacheInfoTemplate from "../../../views/partials/map-cache-info.hbs";
import dataDownloadTemplate from "../../../views/partials/messages/data_download.hbs";
import dataUploadTemplate from "../../../views/partials/messages/data_upload.hbs";
import MapCache from "../tool/MapCache.js";

// Copied from ol/interaction/Translate.js
const TRANSLATEEND = "translateend";

/**
 * Sig builder.
 */
export default async function(isOnline) {

  let idbm = await (new Idbm()).openDB();
  let hiveDAO = new HiveDAO(idbm);
  let zoneDAO = new ZoneDAO(idbm);
  let extentDAO = new ExtentDAO(idbm);
  let zoneForm = await getZoneForm(idbm, isOnline);
  let hiveForm = await getHiveForm();
  const hivesLayerName = "hivesLayer";
  const vegetationsLayerName = "vegetationsLayer";
  const extentsLayerName = "extentsLayer";
  const errorsLayerName = "errorsLayer";
  const bdorthoLayerName = "bdorthoLayer";
  let map = await getMap(hivesLayerName, vegetationsLayerName, extentsLayerName, errorsLayerName, bdorthoLayerName, isOnline);

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

  // Set up the extents layer source
  if (isOnline) {
    var extentsLayerSource = map.getLayerByName(extentsLayerName).getSource();
    // Set the default values and save the new extent
    extentsLayerSource.on(VectorEventType.ADDFEATURE, function(e){
      e.feature.setProperties({
        layerName: extentsLayerName,
        dao: extentDAO,
      }, true);
      if ( typeof e.feature.getId() === "undefined" ) {
        extentDAO.createFeature(e.feature); // Note: Raise the dispatching of the CHANGEFEATURE event
      }
    });
    // Add the features from the local database
    extentsLayerSource.addFeatures(await extentDAO.featuresToGeoJson());
  }

  var interactions = {
    // Add Hive Button Control
    addhive : new AddHive({
      source: hivesLayerSource
    }),
    // Draw Polygon Button Control
    drawpolygon : new Draw({
      source: vegetationsLayerSource,
      type: "Polygon"
    }),
    // Draw Circle Button Control
    drawcircle : new Draw({
      source: vegetationsLayerSource,
      type: "Circle"
    }),
    // Translate Button Control
    translate : new Translate(),
    // Modify Button Control
    modify : [
      new ModifyFeature({
        source: vegetationsLayerSource
      })
    ],
    // Erase Button Control
    erase : new RemoveFeatures(),
    // Edit Zone Properties interaction
    editproperties : new EditProperties()
  };

  if (isOnline) {
    // Draw Extent Button Control
    interactions.drawextent = new Draw({
      source: extentsLayerSource,
      type: "Polygon"
    });
    // Modify Button Control
    interactions.modify.push(new ModifyFeature({
      source: extentsLayerSource
    }));
  }

  // Management of the interactions events
  interactions.translate.on(
    TRANSLATEEND,
    function(e){
      e.features.forEach(function(feature){
        feature.getProperties().dao.updateFeature(feature);
      }, this);
    }
  );
  interactions.modify.forEach(function(interaction) {
    interaction.on(
      ModifyFeatureEventType.MODIFYFEATURES,
      function(e){
        e.features.forEach(function(feature){
          feature.getProperties().dao.updateFeature(feature);
        }, this);
      }
    );
  });
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
      map.addInteractions(interactions[$(this)[0].dataset.shortid]);
      $("#ancgis-map").trigger("interactionAdded");
    } else {
      map.removeInteractions(interactions[$(this)[0].dataset.shortid]);
    }
  });
  $("#ancgis-mapcontrol-tbar>button").on("controlChange", function(event) {
    event.stopPropagation();
    if($(this).is(".active")){
      $(this).toggleClass("active");
      map.removeInteractions(interactions[$(this)[0].dataset.shortid]);
    }
  });
  // Keep the editproperties on the top of the map's interactions
  window.addEventListener("contextmenu", function(e) { e.preventDefault(); });
  map.addInteractions(interactions.editproperties);
  $("#ancgis-map").on("interactionAdded", function(event) {
    event.stopPropagation();
    map.removeInteractions(interactions.editproperties);
    map.addInteractions(interactions.editproperties);
  });

  // Cache the map tiles
  let cache = new MapCache({
    map,
    extentsLayerName,
    catchedLayerNames: [bdorthoLayerName]
  });

  // Management of the SyncInfo toolbar
  async function updateSyncInfo() {
    let count = await zoneDAO.getDirtyDocumentsCount();
    count += await hiveDAO.getDirtyDocumentsCount();
    count += await extentDAO.getDirtyDocumentsCount();
    let syncInfoHtml = syncInfoTemplate({count});
    $("#ancgis-uploadinfo-tbar .content").remove();
    $("#ancgis-uploadinfo-tbar").append(syncInfoHtml);
    // Tooltip activation
    $("[data-toggle=\"tooltip\"]").tooltip({
      trigger : "hover"
    });
  }
  zoneDAO.addEventListener("dirtyAdded", updateSyncInfo);
  hiveDAO.addEventListener("dirtyAdded", updateSyncInfo);
  extentDAO.addEventListener("dirtyAdded", updateSyncInfo);
  updateSyncInfo(); // Initialization

  // Management of the upload button
  $("#ancgis-topright-upload, #ancgis-topright-upload2").click(async function() {
    Promise.all([
      hiveDAO.uploadFeatures(),
      zoneDAO.uploadFeatures(),
      extentDAO.uploadFeatures()
    ]).then(function(results){
      let finalSuccess = true;
      const finalMessage = dataUploadTemplate({results});
      results.forEach(function(result){
        finalSuccess = finalSuccess && result.success;
      });
      displayMapMessage(finalMessage, finalSuccess ? "success" : "error", true, false);
      if (!finalSuccess) {
        // Management of the errors links
        $(".ancgis-appmessage-onmap a").click(function(event) {
          event.stopPropagation();
          event.preventDefault();
          let feature = map.getFeatureById($(this)[0].dataset.id);
          let errorsLayerSource = map.getLayerByName(errorsLayerName).getSource();
          errorsLayerSource.addFeature(feature);
          window.setTimeout(function(){
            errorsLayerSource.removeFeature(feature);
          }, 5000);
        });
      }
      updateSyncInfo();
    }, function(){})
    .catch(function(){
      displayMapMessage("La soumission des données a échoué. Veuillez réessayer.", "error", false);
      updateSyncInfo();
    });
  });

  // Management of the download button
  $("#ancgis-topright-download, #ancgis-topright-download2").click(async function() {
    const count = {
      hives: await hiveDAO.downloadFeatures(),
      zones: await zoneDAO.downloadFeatures(),
      extents: await extentDAO.downloadFeatures()
    };
    if ((count.hives.added + count.hives.updated + count.hives.deleted) > 0) {
      hivesLayerSource.clear();
      hivesLayerSource.addFeatures(await hiveDAO.featuresToGeoJson());
    }
    if ((count.zones.added + count.zones.updated + count.zones.deleted) > 0) {
      vegetationsLayerSource.clear();
      vegetationsLayerSource.addFeatures(await zoneDAO.featuresToGeoJson());
    }
    if ((count.extents.added + count.extents.updated + count.extents.deleted) > 0) {
      extentsLayerSource.clear();
      extentsLayerSource.addFeatures(await extentDAO.featuresToGeoJson());
      cache.updateCache();
    }
    displayMapMessage(dataDownloadTemplate({count}), "success", true, false);
  });

  // Management of the draw extent button
  // Note: To avoid to surcharge the "management of the toggling of the interactions" code part,
  // we simulate a button in the mapcontrol toolbar.
  $("#ancgis-topright-drawextent, #ancgis-topright-drawextent2").click(function() {
    event.stopPropagation();
    $("#ancgis-topright-drawextent").toggleClass("active");
    $("#ancgis-topright-drawextent2").toggleClass("active");
    $("#ancgis-mapcontrol-drawextent").trigger("click");
  });
  $("#ancgis-mapcontrol-drawextent, #ancgis-topright-drawextent2").on("controlChange", function(event) {
    event.stopPropagation();
    if($("#ancgis-topright-drawextent").is(".active")){
      $("#ancgis-topright-drawextent").toggleClass("active");
      $("#ancgis-topright-drawextent2").toggleClass("active");
    }
  });

  // Management of the zoom to feature button
  $("#ancgis-topright-zoomtofeature, #ancgis-topright-zoomtofeature2").click(function() {
    event.stopPropagation();
    let extent = null;
    if ( hivesLayerSource.getFeatures().length !== 0 ) {
      extent = hivesLayerSource.getExtent();
      if ( vegetationsLayerSource.getFeatures().length !== 0 ) {
        olExtentExtend(extent, vegetationsLayerSource.getExtent());
      }
    } else if ( vegetationsLayerSource.getFeatures().length !== 0 ) {
      extent = vegetationsLayerSource.getExtent();
    }
    if ( extent !== null ) {
      map.getView().fit(extent, {duration: 1000});
    }
  });

  // Management of the display histrogram button
  $(".ol-periodswitcher").hide();
  // Note: Initialization with "display" set to "none" on the element style,
  // not on the ".ol-periodswitcher" class (where "display" is set to "flex").
  $("#ancgis-topright-displayhistrogram, #ancgis-topright-displayhistrogram2").click(function() {
    event.stopPropagation();
    $("#ancgis-topright-displayhistrogram").toggleClass("active");
    $("#ancgis-topright-displayhistrogram2").toggleClass("active");
    $(".ol-periodswitcher").toggle();
  });

  // Management of the display layer switcher button
  $("#ancgis-topright-displayLayerSwitcher, #ancgis-topright-displayLayerSwitcher2").click(function() {
    event.stopPropagation();
    let layerSwitcher = map.getControls().item(0);
    layerSwitcher.showPanel();
  });

  // Management of the database reset button
  $("#ancgis-topright-dbreset").click(function() {
    event.stopPropagation();
    idbm.deleteAll().then(function() {
      displayMapMessage("Suppression de la base de donnnées réussie.</br>Veuillez patienter durant le rechargement de la page...", "success", true, false);
      window.location.reload();
    }, function(error) {
      displayMapMessage("La suppression de la base de donnnées a échoué. Veuillez réessayer.", "error", true, false);
    });
  });

  // Management of the map cache reset button
  $("#ancgis-topright-mapcachereset").click(function() {
    event.stopPropagation();
    const cacheName = "ancgis-statics-tiles";
    caches.has(cacheName).then(function(cacheExists) {
      if (cacheExists) {
        caches.delete(cacheName).then(function(success) {
          if(success){
            displayMapMessage("Suppression du cache cartographique réussi.</br>Veuillez patienter durant le rechargement du cache...", "success", true, false);
            cache.updateCache();
          } else {
            displayMapMessage("La suppression du cache cartographique a échoué. Veuillez réessayer.", "error", true, false);
          }
        });
      } else {
        displayMapMessage("Cache cartographique inexistant.</br>Veuillez patienter durant la création du cache...", "info", true, false);
        cache.updateCache();
      }
    });
  });

  // Management of the application reload button
  $("#ancgis-topright-appreload").click(function() {
    event.stopPropagation();
    const cacheName = "ancgis-statics-ressources";
    caches.has(cacheName).then(function(cacheExists) {
      if (cacheExists) {
        caches.delete(cacheName).then(function(success) {
          if(success){
            displayMapMessage("Suppression du cache applicatif réussi.</br>Veuillez patienter durant le rechargement de la page...", "success", true, false);
            window.location.reload();
          } else {
            displayMapMessage("La suppression du cache applicatif a échoué. Veuillez réessayer.", "error", true, false);
          }
        });
      } else {
        displayMapMessage("Cache applicatif inexistant.</br>Veuillez patienter durant le rechargement de la page...", "info", true, false);
        window.location.reload();
      }
    });
  });

  // Management of the MapCacheInfo toolbar
  cache.addEventListener("tileAdded", function(count, total) {
    let mapCacheInfoHtml = mapCacheInfoTemplate({count, total});
    $("#ancgis-mapstatus-mapcachesync .content").remove();
    $("#ancgis-mapstatus-mapcachesync").append(mapCacheInfoHtml);
    // Tooltip activation
    $("[data-toggle=\"tooltip\"]").tooltip({
      trigger : "hover"
    });
    if (count === total) {
      displayMapMessage("Cache cartographique mis à jour.", "success", true);
      setTimeout(function(){
        $("#ancgis-mapstatus-mapcachesync .content").remove();
      }, 3000);
    }
  });
  cache.addEventListener("cacheUpdateError", function(message) {
    displayMapMessage(message, "error", true);
    setTimeout(function(){
      $("#ancgis-mapstatus-mapcachesync .content").remove();
    }, 3000);
  });

  // Management of the menus buttons
  $(".dropdown-item").click(function() {
    event.stopPropagation();
    $(this).parent().removeClass("show");
    $(this).parent().parent().removeClass("show");
  });

  // Management of the extents layer change
  extentDAO.addEventListener("dirtyAdded", cache.updateCache.bind(cache));

  return { map, interactions };
}
