/**
 * Zone form builder.
 */
module.exports = (function() {

  return {
    show: function (feature) {
      // Requirements
      var zoneFormTemplate = require("../../../views/partials/form/zone.hbs");
      var floreLineTemplate = require("../../../views/partials/form/flore-line.hbs");
      var zoneDAO = require('../dao/zone');

      // Setup the local vars
      var ppts = feature.getProperties();
      var newPpts = jQuery.extend(true, {flore:[]}, ppts);
      delete newPpts.geometry;

      // Update the species lines
      function updateSpeciesLines(ppts) {
        const tbody = $('.anc-form-florefields>table>tbody');
        tbody.empty();
        tbody.append(floreLineTemplate({species: ppts.flore}));
        $('.anc-form-removespecies>span').click(onRemoveSpeciesClick); // eslint-disable-line no-use-before-define
      }

      // Remove buttons handler function
      function onRemoveSpeciesClick(event) {
        event.stopPropagation();
        // remove the new species from the local properties object
        const id = Number($(this).parent().attr("data-id"));
        const speciesIndex = newPpts.flore.findIndex(function(species) {
    			return species.taxon.id === id;
    		});
        if (speciesIndex !== -1) {
          newPpts.flore.splice(speciesIndex,1);
          // Update the view
          updateSpeciesLines(newPpts);
        }
      }

      // HTML builds
      var zoneFormHtml = zoneFormTemplate();
      var floreLineHtml = floreLineTemplate({species: ppts.flore});
      $('body').append(zoneFormHtml);
      $('#anc-zoneform-typefield').val(ppts.type);
      $('.anc-form-florefields>table>tbody').append(floreLineHtml);
      $('#anc-zoneform [data-toggle="tooltip"]').tooltip();
      $('#anc-zoneform').focus();

      // keys handler
      // Note: 'keypress' doesn't seem to be handled consistently
      // between browsers whereas keyup is consistent.
      $('#anc-zoneform-typefield').on("keypress", function (event) {
          event.stopPropagation();
          event.preventDefault();
        });
      $('#anc-zoneform, #anc-zoneform-typefield').on("keyup", function (event) {
        if (event.keyCode === 27) { // ESC
          event.stopPropagation();
          event.preventDefault();
          $('#anc-zoneform').remove();
        } else if (event.keyCode === 13) { // ENTER
          event.stopPropagation();
          event.preventDefault();
          feature.setProperties(newPpts);
          zoneDAO.updateFeature(feature);
        }
      });

      // Manage the 'speciesFormValidated' event thrown by the species form
      $('#anc-zoneform').on('speciesFormValidated', function(event, sfValues) {
        event.stopPropagation();
        // Check the absence of the taxon
        if(!newPpts.flore.some(function(species) {
          return species.taxon.id === sfValues.taxon.id;
        })) {
          // Add the new species to the local properties object
          newPpts.flore.push(sfValues);
          // Update the view
          updateSpeciesLines(newPpts);
        } else {
          // TODO: Display an Error
          console.error(Error('Species already present'));
        }
      });

      // Manage the 'change' event thrown by the type field
      $('#anc-zoneform-typefield').change(function() {
        newPpts.type = $('#anc-zoneform-typefield').val();
      });

      // Add species button handler
      $('#anc-zoneform-addspeciesbtn').click(function(event) {
        event.stopPropagation();
        $('#anc-zoneform').hide();
        // Display the species form
        var speciesForm = require('./species');
        speciesForm.show();
      });

      // Remove buttons handler
      $('.anc-form-removespecies>span').click(onRemoveSpeciesClick);

      // Cancel button handler
      $('#anc-zoneform-cancelbtn').click(function(event) {
        event.stopPropagation();
        $('#anc-zoneform').remove();
      });

      // Validate button handler
      $("#anc-zoneform-validatebtn").click(function() {
        event.stopPropagation();
        feature.setProperties(newPpts);
        zoneDAO.updateFeature(feature);
      });
    }
  }
})();
