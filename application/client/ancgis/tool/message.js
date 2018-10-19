/**
 * Message tools
 */
import appMessageTemplate from "../../../views/partials/app-message.hbs"

function displayMessage(message, msgDivSelector, cleanPreviousMsg = false) {
  const appMessageHTML = appMessageTemplate(message);
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
export function displayMapMessage(message, type, cleanPreviousMsg) {
  let msg = {"messages": {}};
  msg.messages[type] = message;
  displayMessage(msg, ".ancgis-appmessage-onmap", cleanPreviousMsg);
}

export function displayFormatedLoginMessage(message, cleanPreviousMsg) {
  displayMessage(message, ".ancgis-appmessage", cleanPreviousMsg);
}

export function displayLoginMessage(message, type, cleanPreviousMsg) {
  displayMessage({"messages":{type: message}}, ".ancgis-appmessage", cleanPreviousMsg);
}