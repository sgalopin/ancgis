/**
 * Species form builder.
 */
module.exports = function() {

  // Requirements
  var speciesFormTemplate = require("../../../views/partials/form/species.hbs");

  // Get the taxon fields
  var idbms = require('../dbms/indexedDB');
  idbms.readAll()
  .then(function(taxons) {
    // HTML builds
    var speciesFormHtml = speciesFormTemplate({taxons: taxons});
    $('body').append(speciesFormHtml);
    $('#anc-speciesform [data-toggle="tooltip"]').tooltip();

    // Cancel button handler
    $('#anc-speciesform-cancelbtn').on('click', function(event) {
      event.stopPropagation();
      $('#anc-speciesform').remove();
      $('#anc-zoneform').show();
    });

    // Validate button handler
    $("#anc-speciesform-validatebtn").on('click', function() {
      event.stopPropagation();
      // Check the recovery field value
      var rf = $('#anc-speciesform-recoveryfield');
      const recovery = Number(rf.val());
      if (recovery < Number(rf.attr("min"))
        || recovery > Number(rf.attr("max"))) {
        // TODO: Print an error message
        console.log(Error('Bad recovery value'));
      } else {
        // Get the taxon fields
        var idbms = require('../dbms/indexedDB');
        idbms.read(Number($('#anc-speciesform-taxonfield').val()))
        .then(function(taxon) {
          // Fire the end event
          $('#anc-zoneform').trigger('speciesFormValidated', {
            taxon: taxon,
            recovery: recovery
          });
          $('#anc-speciesform').remove();
          $('#anc-zoneform').show();
        }, function(err) {
          console.error(err);
        });
      }
    });
  }, function(err) { // Catch the 'readAll' function error
    console.error(err);
  })
  .catch(function(err) { // Catch the 'then' function error
    console.error(err);
  });
}
