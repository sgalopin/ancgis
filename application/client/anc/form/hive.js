/**
 * Hive form builder.
 */
module.exports = (function() {

  return {
    show(feature) {
      // Requirements
      var hiveFormTemplate = require("../../../views/partials/form/hive.hbs");
      var hiveDAO = require('../dao/hive');

      // Setup the local vars
      var ppts = feature.getProperties();
      var newPpts = jQuery.extend(true, {}, ppts);
      delete newPpts.geometry;

      // HTML builds
      var hiveFormHtml = hiveFormTemplate();
      $('body').append(hiveFormHtml);
      $('#anc-hiveform-registrationNumberfield').val(ppts.registrationNumber);
      $('#anc-hiveform-typefield').val(ppts.type);
      $('#anc-hiveform-framesCountfield').val(ppts.framesCount);
      $('#anc-hiveform [data-toggle="tooltip"]').tooltip();
      $('#anc-hiveform').focus();

      // keys handler
      // Note: 'keypress' doesn't seem to be handled consistently
      // between browsers whereas keyup is consistent.
      $('#anc-hiveform select').on("keypress", function (event) {
        event.stopPropagation();
        event.preventDefault();
      });
      $('#anc-hiveform, #anc-hiveform input, #anc-hiveform select').on("keyup", function (event) {
        if (event.keyCode === 27) { // ESC
          event.stopPropagation();
          event.preventDefault();
          $('#anc-hiveform').remove();
        } else if (event.keyCode === 13) { // ENTER
          event.stopPropagation();
          event.preventDefault();
          feature.setProperties(newPpts);
          hiveDAO.updateFeature(feature)
          .done(function(response) {
            if (response.status === 'success') {
              $('#anc-hiveform').remove();
            }
          });
        }
      });

      // Manage the 'change' event thrown by the registrationNumber field
      $('#anc-hiveform-registrationNumberfield').change(function() {
        newPpts.registrationNumber = $('#anc-hiveform-registrationNumberfield').val();
      });

      // Manage the 'change' event thrown by the type field
      $('#anc-hiveform-typefield').change(function() {
        newPpts.type = $('#anc-hiveform-typefield').val();
      });

      // Manage the 'change' event thrown by the framesCount field
      $('#anc-hiveform-framesCountfield').change(function() {
        newPpts.framesCount = $('#anc-hiveform-framesCountfield').val();
      });

      // Cancel button handler
      $('#anc-hiveform-cancelbtn').click(function(event) {
        event.stopPropagation();
        $('#anc-hiveform').remove();
      });

      // Validate button handler
      $("#anc-hiveform-validatebtn").click(function() {
        event.stopPropagation();
        feature.setProperties(newPpts);
        hiveDAO.updateFeature(feature)
        .done(function(response) {
          if (response.status === 'success') {
            $('#anc-hiveform').remove();
          }
        });
      });
    }
  }
})();
