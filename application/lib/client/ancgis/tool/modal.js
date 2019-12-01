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