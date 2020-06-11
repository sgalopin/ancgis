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

import hiveFormTemplate from "../../../views/partials/form/hive.hbs";

/**
 * Hive form builder.
 */
export default async function() {

  return {
    show(map, feature) {

      // Setup the local vars
      var ppts = feature.getProperties();
      var newPpts = jQuery.extend(true, {}, ppts);
      delete newPpts.geometry;

      // HTML builds
      var hiveFormHtml = hiveFormTemplate();
      $("body").append(hiveFormHtml);
      $("#ancgis-hiveform-registrationNumberfield").val(ppts.registrationNumber);
      $("#ancgis-hiveform-typefield").val(ppts.type);
      $("#ancgis-hiveform-framesCountfield").val(ppts.framesCount);
      $("#ancgis-hiveform [data-toggle=\"tooltip\"]").tooltip();
      $("#ancgis-hiveform").focus();

      // keys handler
      // Note: "keypress" doesn't seem to be handled consistently
      // between browsers whereas keyup is consistent.
      $("#ancgis-hiveform select").on("keypress", function (event) {
        event.stopPropagation();
        event.preventDefault();
      });
      $("#ancgis-hiveform, #ancgis-hiveform input, #ancgis-hiveform select").on("keyup", function (event) {
        if (event.keyCode === 27) { // ESC
          event.stopPropagation();
          event.preventDefault();
          $("#ancgis-hiveform").remove();
        } else if (event.keyCode === 13) { // ENTER
          event.stopPropagation();
          event.preventDefault();
          feature.setProperties(newPpts);
          feature.getProperties().dao.updateFeature(feature)
          .then(function(response) {
            $("#ancgis-hiveform").remove();
          });
        }
      });

      // Manage the "change" event thrown by the registrationNumber field
      $("#ancgis-hiveform-registrationNumberfield").change(function() {
        newPpts.registrationNumber = $("#ancgis-hiveform-registrationNumberfield").val();
      });

      // Manage the "change" event thrown by the type field
      $("#ancgis-hiveform-typefield").change(function() {
        newPpts.type = $("#ancgis-hiveform-typefield").val();
      });

      // Manage the "change" event thrown by the framesCount field
      $("#ancgis-hiveform-framesCountfield").change(function() {
        newPpts.framesCount = $("#ancgis-hiveform-framesCountfield").val();
      });

      // Cancel button handler
      $("#ancgis-hiveform-cancelbtn").click(function(event) {
        event.stopPropagation();
        $("#ancgis-hiveform").remove();
      });

      // Validate button handler
      $("#ancgis-hiveform-validatebtn").click(function() {
        event.stopPropagation();
        feature.setProperties(newPpts);
        feature.getProperties().dao.updateFeature(feature)
        .then(function(response) {
          $("#ancgis-hiveform").remove();
        });
      });
    }
  };
}
