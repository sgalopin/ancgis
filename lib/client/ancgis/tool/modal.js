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

/**
 * Modal tools
 */
export function confirm(message) {
  return new Promise(function(resolve, reject) {
    // Adds the message to the box body
    $("#ancgis-confirm .modal-body").text(message);
    // Displays the modal box
    $("#ancgis-confirm").modal("show");
    // Focus on the modal box (Required per the "ENTER" keyup event).
    $("#ancgis-confirm").focus();
    // Manages the click event on the OK button
    $("#ancgis-confirm .btn-primary").one("click", function (e) {
      resolve(e);
    });
    // Manages the "ENTER" keyup event
    $("#ancgis-confirm").on("keyup", function (e) {
      if (e.keyCode === 13) { // ENTER
        $("#ancgis-confirm .btn-primary").trigger("click", e);
      }
    });
    // Manages the closing of the modal box
    // Note: The 'data-dismiss="modal"' data causes the closing on buttons click
    $("#ancgis-confirm").one("hide.bs.modal", function (e) {
      $("#ancgis-confirm").blur(); // Important for the map "keyup" event.
      $("#ancgis-confirm .btn-primary").off("click");
      reject(e);
    });
  });
}
