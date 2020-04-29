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
 
import zoneFormTemplate from "../../../views/partials/form/zone.hbs";
import floreLineTemplate from "../../../views/partials/form/flore-line.hbs";
import getSpeciesForm from "./species.js";
import * as log from "loglevel";

/**
 * Zone form builder.
 */
export default async function(idbm, isOnline) {

  let speciesForm = await getSpeciesForm(idbm, isOnline);

  return {
    show(map, feature) {

      // Setup the local vars
      var ppts = feature.getProperties();
      var newPpts = jQuery.extend(true, {flore:[]}, ppts);
      delete newPpts.geometry;

      // Update the species lines
      function updateSpeciesLines(ppts) {
        const tbody = $(".ancgis-form-florefields>table>tbody");
        tbody.empty();
        tbody.append(floreLineTemplate({species: ppts.flore}));
        $(".ancgis-form-removespecies>span").click(onRemoveSpeciesClick); // eslint-disable-line no-use-before-define
        $(".ancgis-form-florefields>table>tbody [data-toggle=\"tooltip\"]").tooltip();
      }

      // Remove buttons handler function
      function onRemoveSpeciesClick(event) {
        event.stopPropagation();
        // remove the new species from the local properties object
        const id = Number($(this).parent().attr("data-id"));
        const speciesIndex = newPpts.flore.findIndex(function(species) {
          return species.taxon.id === id;
        });
        if (speciesIndex !== -1) {
          newPpts.flore.splice(speciesIndex,1);
          // Update the view
          updateSpeciesLines(newPpts);
        }
      }

      // HTML builds
      var zoneFormHtml = zoneFormTemplate();
      var floreLineHtml = floreLineTemplate({species: ppts.flore});
      $("body").append(zoneFormHtml);
      $("#ancgis-zoneform-typefield").val(ppts.type);
      $(".ancgis-form-florefields>table>tbody").append(floreLineHtml);
      $("#ancgis-zoneform [data-toggle=\"tooltip\"]").tooltip();
      $("#ancgis-zoneform").focus();

      // keys handler
      // Note: "keypress" doesn't seem to be handled consistently
      // between browsers whereas keyup is consistent.
      $("#ancgis-zoneform-typefield").on("keypress", function (event) {
          event.stopPropagation();
          event.preventDefault();
        });
      $("#ancgis-zoneform, #ancgis-zoneform-typefield").on("keyup", function (event) {
        if (event.keyCode === 27) { // ESC
          event.stopPropagation();
          event.preventDefault();
          $("#ancgis-zoneform").remove();
        } else if (event.keyCode === 13) { // ENTER
          event.stopPropagation();
          event.preventDefault();
          feature.setProperties(newPpts);
          feature.getProperties().dao.updateFeature(feature)
          .then(function(response) {
            $("#ancgis-zoneform").remove();
          });
        }
      });

      // Manage the "speciesFormValidated" event thrown by the species form
      $("#ancgis-zoneform").on("speciesFormValidated", function(event, sfValues) {
        event.stopPropagation();
        // Check the absence of the taxon
        if(!newPpts.flore.some(function(species) {
          return species.taxon.id === sfValues.taxon.id;
        })) {
          // Add the new species to the local properties object
          newPpts.flore.push(sfValues);
          // Update the view
          updateSpeciesLines(newPpts);
        } else {
          // TODO: Display an Error
          log.error(Error("Species already present"));
        }
      });

      // Manage the "change" event thrown by the type field
      $("#ancgis-zoneform-typefield").change(function() {
        newPpts.type = $("#ancgis-zoneform-typefield").val();
      });

      // Add species button handler
      $("#ancgis-zoneform-addspeciesbtn").click(function(event) {
        event.stopPropagation();
        $("#ancgis-zoneform").hide();
        // Display the species form
        speciesForm.show();
      });

      // Remove buttons handler
      $(".ancgis-form-removespecies>span").click(onRemoveSpeciesClick);

      // Cancel button handler
      $("#ancgis-zoneform-cancelbtn").click(function(event) {
        event.stopPropagation();
        $("#ancgis-zoneform").remove();
      });

      // Validate button handler
      $("#ancgis-zoneform-validatebtn").click(function() {
        event.stopPropagation();
        feature.setProperties(newPpts);
        feature.getProperties().dao.updateFeature(feature)
        .then(function(response) {
          $("#ancgis-zoneform").remove();
          map.dispatchPeriodPotentialChangeEvent();
        });
      });
    }
  };
}
