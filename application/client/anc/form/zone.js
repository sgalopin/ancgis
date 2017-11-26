/**
 * Zone form builder.
 */
module.exports = function(feature) {

  // Requirements
  var zoneFormTemplate = require("../../../views/partials/form/zone.hbs");
  var floreLineTemplate = require("../../../views/partials/form/flore-line.hbs");

  // Setup the local vars
  var ppts = feature.getProperties();
  var newPpts = jQuery.extend(true, {}, ppts);
  delete newPpts.geometry;

  // HTML builds
  var zoneFormHtml = zoneFormTemplate();
  var floreLineHtml = floreLineTemplate({species: ppts.flore});
  $('body').append(zoneFormHtml);
  $('#anc-zoneform-typefield').val(ppts.type);
  $('.anc-form-florefields>table>tbody').append(floreLineHtml);
  $('#anc-zoneform [data-toggle="tooltip"]').tooltip();

  // Manage the 'change' event thrown by the type field
  $('#anc-zoneform-typefield').change(function() {
    newPpts.type = $('#anc-zoneform-typefield').val();
  });

  // Add species button handler
  $('#anc-zoneform-addspeciesbtn').click(function(event) {
    event.stopPropagation();
    $('#anc-zoneform').hide();
    // Display the species form
    var buildForm = require('./species');
    buildForm();
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
    updateFeature(newPpts);
  });

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

  // Update the species lines
  function updateSpeciesLines(uPpts) {
    const tbody = $('.anc-form-florefields>table>tbody');
    tbody.empty();
    tbody.append(floreLineTemplate({species: uPpts.flore}));
    $('.anc-form-removespecies>span').click(onRemoveSpeciesClick);
  }

  // Update the zone's properties
  function updateFeature (uPpts) {
    // Update the feature locally
    feature.setProperties(uPpts);

    // Update the feature remotly
    uPpts.flore = uPpts.flore.map(function(obj) {
        return { taxon: obj.taxon.id, recovery: obj.recovery };
    });
    jQuery.ajax({ // TODO: use promise
      url: '/rest/vegetation-zones/' + feature.getId(),
      type: 'PUT',
      data: JSON.stringify({
        "properties": uPpts
      }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(response) {
        if (response.status === 'success') {
          // TODO: Save locally into indexDB (sync = true)
          $('#anc-zoneform').remove();
        } else {
          // TODO: Display an error message
          // TODO: Save locally into indexDB (sync = false)
          // TODO: Make the synchronization with a web worker.
        }
      }
      // TODO: Catch the error
    });
  }
}
