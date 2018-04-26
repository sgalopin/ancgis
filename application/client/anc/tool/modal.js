/**
 * Modal tools
 */
module.exports = (function() {

  // Display a confirm modal box
  return {
    confirm(message) {
      return new Promise(function(resolve, reject) {
        // Adds the message to the box body
        $("#anc-confirm .modal-body").text(message);
        // Displays the modal box
        $("#anc-confirm").modal("show");
        // Focus on the modal box (Required per the "ENTER" keyup event).
        $("#anc-confirm").focus();
        // Manages the click event on the OK button
        $("#anc-confirm .btn-primary").one("click", function (e) {
          resolve(e);
        });
        // Manages the "ENTER" keyup event
        $("#anc-confirm").on("keyup", function (e) {
          if (e.keyCode === 13) { // ENTER
            $("#anc-confirm .btn-primary").trigger("click", e);
          }
        });
        // Manages the closing of the modal box
        // Note: The 'data-dismiss="modal"' data causes the closing on buttons click
        $("#anc-confirm").one("hide.bs.modal", function (e) {
          $("#anc-confirm").blur(); // Important for the map "keyup" event.
          $("#anc-confirm .btn-primary").off("click");
          reject(e);
        });
      });
    }
  };
}());