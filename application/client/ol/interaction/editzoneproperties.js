goog.provide('ol.interaction.EditZoneProperties');

/**
 * @classdesc
 * Allows the user to edit the properties of the selected feature.
 *
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.EditZonePropertiesOptions=} opt_options Options.
 * @api
 */
ol.interaction.EditZoneProperties = function(opt_options) {

  ol.interaction.Interaction.call(this, {
    handleEvent: ol.interaction.EditZoneProperties.prototype.handleEvent
  });

  var options = opt_options || {};

  /**
   * @type {ol.Feature}
   * @private
   */
  this.feature_ = null;

  /**
   * The callback function to call with the feature
   * @type {Function}
   * @private
   */
  this.callback_ =  options.callback ? options.callback : null;

  /**
   * The callback scope
   * @type {Object}
   * @private
   */
  this.callbackScope_ =  options.callbackScope ? options.callbackScope : null;

  /**
   * The name of the zones layer.
   * @type {string}
   * @private
   */
  this.zonesLayerName_ =  options.zonesLayerName ? options.zonesLayerName : null;

};
ol.inherits(ol.interaction.EditZoneProperties, ol.interaction.Interaction);

/**
 * Handles the {@link ol.MapBrowserEvent map browser event}
 * to eventually display the zone properties form.
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} Allow event propagation.
 * @this {ol.interaction.EditZoneProperties}
 * @api
 */
ol.interaction.EditZoneProperties.prototype.handleEvent = function(evt) {

  // On right click only
  if (evt.type === "pointerdown" && evt.pointerEvent.button === 2) {
    evt.preventDefault();
    var map = evt.map;
    var zonesLayerName = this.zonesLayerName_;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        },{
          layerFilter : function(layerCandidate){
            if (layerCandidate.get('name') === zonesLayerName) {
              return true;
            } else {
              return false;
            }
          }
        });

    if (feature) {
      this.feature_ = feature;
      this.callback_.call(this.callbackScope_,feature);
    }

    return false;
  }

  return true;
};
