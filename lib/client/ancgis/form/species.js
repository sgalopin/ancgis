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

import speciesFormTemplate from "../../../views/partials/form/species.hbs";
import {displayMapMessage} from "../tool/message.js";
import * as log from "loglevel";

/**
 * Species form builder.
 */
export default async function(idbm, isOnline) {

  return {
    show() {

      // Manage the validation of the form
      function validateForm () {
        let formIsValid = true;
        // Check the recovery field value
        var rf = $("#ancgis-speciesform-recoveryfield");
        let recovery = Number(rf.val());
        recovery === 0 && (recovery = 100); // Set default value to 100
        if (recovery < 0 || recovery > 100) {
          // TODO: Display the error into the form
          displayMapMessage("Recouvrement invalide.", "error", true);
          formIsValid = false;
        }
        // Get the taxon fields
        const currentValue = $("#ancgis-speciesform-taxonfield").val();
        const selectedTaxonId = $('#ancgis-speciesform-taxonfield-datalist [value="' + currentValue + '"]').data('value');
        if (!selectedTaxonId) {
          // TODO: Display the error into the form
          displayMapMessage("Taxon invalide.", "error", true);
          formIsValid = false;
        }
        if (formIsValid) {
          idbm.read("taxons", Number(selectedTaxonId))
          .then(function(taxon) {
            // Fire the end event
            $("#ancgis-zoneform").trigger("speciesFormValidated", { taxon, recovery });
            $("#ancgis-speciesform").remove();
            $("#ancgis-zoneform").show( 0, function() {
              $("#ancgis-zoneform").focus();
            });
          }, function(err) {
            log.error(err);
          });
        }
      }

      // Get the taxon fields
      idbm.readAll("taxons")
      .then(function(taxons) {

        // Sorts the data
        taxons.sort(function(a, b){
            if(a.name.latin.short < b.name.latin.short) { return -1; }
            if(a.name.latin.short > b.name.latin.short) { return 1; }
            return 0;
        });

        // HTML builds
        var speciesFormHtml = speciesFormTemplate({ isOnline, taxons });
        $("body").append(speciesFormHtml);
        $("#ancgis-speciesform [data-toggle=\"tooltip\"]").tooltip();
        $("#ancgis-speciesform").focus();

        // keys handler
        $("#ancgis-speciesform, #ancgis-speciesform-taxonfield, #ancgis-speciesform-recoveryfield").on("keyup", function (event) {
          if (event.keyCode === 27) { // ESC
            event.stopPropagation();
            event.preventDefault();
            $("#ancgis-speciesform").remove();
            $("#ancgis-zoneform").show( 0, function() {
              $("#ancgis-zoneform").focus();
            });
          } else if (event.keyCode === 13) { // ENTER
            event.stopPropagation();
            event.preventDefault();
            validateForm();
          }
        });
        $("#ancgis-speciesform-taxonfield").on('input', function(event) {
          event.stopPropagation();
          event.preventDefault();
          const currentValue = $(this).val();
          const selectedTaxonId = $('#ancgis-speciesform-taxonfield-datalist [value="' + currentValue + '"]').data('value');
          const smartflore = $('#ancgis-speciesform-taxonfield-datalist [value="' + currentValue + '"]').data('smartflore');
          if (isOnline) {
            if(selectedTaxonId){
              $("#ancgis-speciesform-taxonfield").parent().addClass('show-trigger');
              $("#ancgis-speciesform-taxonfield-loadingdiv").show();
              $("#ancgis-speciesform-taxonfield-iframe").hide();
              $("#ancgis-speciesform-taxonfield-iframe").prop("src","/smartflore/" + smartflore);
            } else {
              $("#ancgis-speciesform-taxonfield").parent().removeClass('show-trigger');
              $("#ancgis-speciesform-taxonfield-loadingdiv").hide();
              $("#ancgis-speciesform-taxonfield-iframe").hide();
              let trigger = $("#ancgis-speciesform-taxonfield-trigger");
              trigger.removeClass("active");
              let span = trigger.children(":first");
              span.addClass("ancgis-glyphicons-546eyeopen");
              span.removeClass("ancgis-glyphicons-546eyeclose");
              $("#ancgis-speciesform").removeClass("enlarged");
              $("#ancgis-speciesform-taxonfield-frame").hide();
            }
          }
        });

        // Add taxonfield trigger handler
        $("#ancgis-speciesform-taxonfield-trigger").click(function(event) {
          event.stopPropagation();
          if (isOnline) {
            $(this).toggleClass("active");
            let span = $(this).children(":first");
            if ($(this).hasClass("active")) {
              span.addClass("ancgis-glyphicons-546eyeclose");
              span.removeClass("ancgis-glyphicons-546eyeopen");
              $("#ancgis-speciesform").addClass("enlarged");
              $("#ancgis-speciesform-taxonfield-frame").show();
            } else {
              span.addClass("ancgis-glyphicons-546eyeopen");
              span.removeClass("ancgis-glyphicons-546eyeclose");
              $("#ancgis-speciesform").removeClass("enlarged");
              $("#ancgis-speciesform-taxonfield-frame").hide();
            }
          }
        });

        // Add taxonfield iframe handler
        $('#ancgis-speciesform-taxonfield-iframe').on("load", function() {
            $("#ancgis-speciesform-taxonfield-loadingdiv").hide();
            $("#ancgis-speciesform-taxonfield-iframe").show();
        });

        // Cancel button handler
        $("#ancgis-speciesform-cancelbtn").on("click", function(event) {
          event.stopPropagation();
          $("#ancgis-speciesform").remove();
          $("#ancgis-zoneform").show( 0, function() {
            $("#ancgis-zoneform").focus();
          });
        });

        // Validate button handler
        $("#ancgis-speciesform-validatebtn").on("click", function(event) {
          event.stopPropagation();
          validateForm();
        });
      }, function(err) { // Catch the "readAll" function error
        log.error(err);
      })
      .catch(function(err) { // Catch the "then" function error
        log.error(err);
      });
    }
  };
}
