// Requirements
import apiaryFormTemplate from "../../../views/partials/form/apiary.hbs";

/**
 * Apiary form builder.
 */
export default async function() {

  return {
    show(map, feature) {

      // Setup the local vars
      var ppts = feature.getProperties();
      var newPpts = jQuery.extend(true, {}, ppts);
      delete newPpts.geometry;

      // HTML builds
      var apiaryFormHtml = apiaryFormTemplate();
      $("body").append(apiaryFormHtml);
      $("#ancgis-apiaryform-registrationNumberfield").val(ppts.registrationNumber);
      $("#ancgis-apiaryform-locationNamefield").val(ppts.locationName);
      $("#ancgis-apiaryform-cityfield").val(ppts.city);
      $("#ancgis-apiaryform-zipCodefield").val(ppts.zipCode);
      $("#ancgis-apiaryform-displayForagingAreafield").prop('checked', ppts.displayForagingArea);
      $("#ancgis-apiaryform [data-toggle=\"tooltip\"]").tooltip();
      $("#ancgis-apiaryform").focus();

      // keys handler
      // Note: "keypress" doesn't seem to be handled consistently
      // between browsers whereas keyup is consistent.
      $("#ancgis-apiaryform select").on("keypress", function (event) {
        event.stopPropagation();
        event.preventDefault();
      });
      $("#ancgis-apiaryform, #ancgis-apiaryform input, #ancgis-apiaryform select").on("keyup", function (event) {
        if (event.keyCode === 27) { // ESC
          event.stopPropagation();
          event.preventDefault();
          $("#ancgis-apiaryform").remove();
        } else if (event.keyCode === 13) { // ENTER
          event.stopPropagation();
          event.preventDefault();
          feature.setProperties(newPpts);
          feature.getProperties().dao.updateFeature(feature)
          .then(function(response) {
            $("#ancgis-apiaryform").remove();
          });
        }
      });

      // Manage the "change" event thrown by the registrationNumber field
      $("#ancgis-apiaryform-registrationNumberfield").change(function() {
        newPpts.registrationNumber = $("#ancgis-apiaryform-registrationNumberfield").val();
      });

      // Manage the "change" event thrown by the locationName field
      $("#ancgis-apiaryform-locationNamefield").change(function() {
        newPpts.locationName = $("#ancgis-apiaryform-locationNamefield").val();
      });

      // Manage the "change" event thrown by the city field
      $("#ancgis-apiaryform-cityfield").change(function() {
        newPpts.city = $("#ancgis-apiaryform-cityfield").val();
      });

      // Manage the "change" event thrown by the zipCode field
      $("#ancgis-apiaryform-zipCodefield").change(function() {
        newPpts.zipCode = $("#ancgis-apiaryform-zipCodefield").val();
      });

      // Manage the "change" event thrown by the displayForagingArea field
      $("#ancgis-apiaryform-displayForagingAreafield").change(function() {
        newPpts.displayForagingArea = $("#ancgis-apiaryform-displayForagingAreafield").prop("checked");
      });

      // Cancel button handler
      $("#ancgis-apiaryform-cancelbtn").click(function(event) {
        event.stopPropagation();
        $("#ancgis-apiaryform").remove();
      });

      // Validate button handler
      $("#ancgis-apiaryform-validatebtn").click(function() {
        event.stopPropagation();
        feature.setProperties(newPpts);
        feature.getProperties().dao.updateFeature(feature)
        .then(function(response) {
          $("#ancgis-apiaryform").remove();
        });
      });
    }
  };
}
