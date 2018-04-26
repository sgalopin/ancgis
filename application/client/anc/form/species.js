/**
 * Species form builder.
 */
module.exports = (function() {

  return {
    show: function (feature) {
      // Requirements
      var speciesFormTemplate = require("../../../views/partials/form/species.hbs");
      var idbms = require("../dbms/indexedDB");

      // Manage the validation of the form
      function validateForm () {
        // Check the recovery field value
        var rf = $("#anc-speciesform-recoveryfield");
        let recovery = Number(rf.val());
        recovery === 0 && (recovery = 100); // Set default value to 100
        if (recovery < 0 || recovery > 100) {
          // TODO: Print an error message
          console.log(Error("Bad recovery value"));
        } else {
          // Get the taxon fields
          var idbms = require("../dbms/indexedDB");
          idbms.read(Number($("#anc-speciesform-taxonfield").val()))
          .then(function(taxon) {
            // Fire the end event
            $("#anc-zoneform").trigger("speciesFormValidated", {
              taxon: taxon,
              recovery: recovery
            });
            $("#anc-speciesform").remove();
            $("#anc-zoneform").show( 0, function() {
              $("#anc-zoneform").focus();
            });
          }, function(err) {
            console.error(err);
          });
        }
      }

      // Get the taxon fields
      idbms.readAll()
      .then(function(taxons) {
        // HTML builds
        var speciesFormHtml = speciesFormTemplate({taxons: taxons});
        $("body").append(speciesFormHtml);
        $("#anc-speciesform [data-toggle=\"tooltip\"]").tooltip();
        $("#anc-speciesform").focus();

        // keys handler
        // Note: 'keypress' doesn't seem to be handled consistently
        // between browsers whereas keyup is consistent.
        $("#anc-speciesform-taxonfield").on("keypress", function (event) {
            event.stopPropagation();
            event.preventDefault();
          });
        $("#anc-speciesform, #anc-speciesform-taxonfield, #anc-speciesform-recoveryfield").on("keyup", function (event) {
          if (event.keyCode === 27) { // ESC
            event.stopPropagation();
            event.preventDefault();
            $("#anc-speciesform").remove();
            $("#anc-zoneform").show( 0, function() {
              $("#anc-zoneform").focus();
            });
          } else if (event.keyCode === 13) { // ENTER
            event.stopPropagation();
            event.preventDefault();
            validateForm();
          }
        });

        // Cancel button handler
        $("#anc-speciesform-cancelbtn").on("click", function(event) {
          event.stopPropagation();
          $("#anc-speciesform").remove();
          $("#anc-zoneform").show( 0, function() {
            $("#anc-zoneform").focus();
          });
        });

        // Validate button handler
        $("#anc-speciesform-validatebtn").on("click", function(event) {
          event.stopPropagation();
          validateForm();
        });
      }, function(err) { // Catch the 'readAll' function error
        console.error(err);
      })
      .catch(function(err) { // Catch the 'then' function error
        console.error(err);
      });
    }
  }
})();
