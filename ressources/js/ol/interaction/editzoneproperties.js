goog.provide('ol.interaction.EditZoneProperties');

/**
 * @classdesc
 * Allows the user to edit the properties of the selected feature.
 *
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {olx.interaction.EditZonePropertiesOptions=} opt_options Options.
 * @api
 */
ol.interaction.EditZoneProperties = function(opt_options) {

  ol.interaction.Pointer.call(this, {
    handleDownEvent: ol.interaction.EditZoneProperties.prototype.handleDownEvent
  });

  var options = opt_options || {};

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null;

  /**
   * The id of the properties form to display.
   * @type {string}
   * @private
   */
  this.propertiesForm_ =  options.propertiesForm ? options.propertiesForm : null;

};
ol.inherits(ol.interaction.EditZoneProperties, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
ol.interaction.EditZoneProperties.prototype.handleDownEvent = function(evt) {
  evt.preventDefault();

  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature) {
        return feature;
      });

  if (feature) {
    this.feature_ = feature;
  }

  if(feature && evt.pointerEvent.button === 2) { // Right click
    var form = document.getElementById(this.propertiesForm_);
    form.classList.remove("hidden");
  }

  //TODO: Pass the feature to the form

  return false;
};