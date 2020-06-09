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
 * Message tools
 */
import appMessageTemplate from "../../../views/partials/app-message.hbs";
import * as log from "loglevel";

function isValidType(type) {
  const msgTypes = ["error", "warning", "info", "success"];
  if (!msgTypes.includes(type)) {
    log.error("Bad message type provided.");
    return false;
  }
  return true;
}

function displayMessage(msg, msgDivSelector, cleanPreviousMsg = false, escapeMsg = true) {
  msg.escapeMsg = escapeMsg;
  const appMessageHTML = appMessageTemplate(msg);
  if (cleanPreviousMsg && $(".alert-dismissible")) {
    $(".alert-dismissible").remove();
  }
  $(msgDivSelector).append(appMessageHTML);
  // Remove all the success messages after 3s
  setTimeout(function(){
    $(".alert-success").remove();
  }, 3000);
}

/**
 * Type: error, warning, info, success
 */
export function displayMapMessage(message, type, cleanPreviousMsg, escapeMsg) {
  if (!isValidType(type)) { return; } // For security (object-injection)
  let msg = {"messages": {}};
  msg.messages[type] = message; // eslint-disable-line security/detect-object-injection
  displayMessage(msg, ".ancgis-appmessage-onmap", cleanPreviousMsg, escapeMsg);
}

export function displayLoginMessage(message, type, cleanPreviousMsg, escapeMsg) {
  if (!isValidType(type)) { return; } // For security (object-injection)
  let msg = {"messages": {}};
  msg.messages[type] = message; // eslint-disable-line security/detect-object-injection
  displayMessage(msg, ".ancgis-appmessage", cleanPreviousMsg, escapeMsg);
}
