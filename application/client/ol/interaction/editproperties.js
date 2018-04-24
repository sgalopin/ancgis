/*global ol*/
goog.provide('ol.interaction.EditProperties');

/**
 * @classdesc
 * Allows the user to edit the properties of the selected feature.
 *
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.EditPropertiesOptions=} opt_options Options.
 * @api
 */
ol.interaction.EditProperties = function(opt_options) {

  var options = opt_options || {};
  options.handleEvent = ol.interaction.EditProperties.prototype.handleEvent;

  ol.interaction.Interaction.call(this, options);

};
ol.inherits(ol.interaction.EditProperties, ol.interaction.Interaction);

/**
 * Handles the {@link ol.MapBrowserEvent map browser event}
 * to eventually display the zone properties form.
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} Allow event propagation.
 * @this {ol.interaction.EditProperties}
 * @api
 */
ol.interaction.EditProperties.prototype.handleEvent = function(evt) {

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
          // Checks if the layer has a name (Avoids the selection of the drawing layers).
          if (layerCandidate.getProperties().hasOwnProperty('name')) {
            return true;
          } else {
            return false;
          }
        }
      }
    );

    if (feature) {
      this.dispatchEvent(
        new ol.interaction.EditProperties.Event(
          ol.interaction.EditProperties.EventType.SELECT,
          feature,
          evt
        )
      );
    }

    return false;
  }

  return true;
};


/**
 * @classdesc
 * Events emitted by {@link ol.interaction.EditProperties} instances are instances of
 * this type.
 *
 * @param {ol.interaction.EditProperties.EventType_} type The event type.
 * @param {ol.Feature} feature Selected feature.
 * @param {ol.MapBrowserEvent} mapBrowserEvent Associated
 *     {@link ol.MapBrowserEvent}.
 * @extends {ol.events.Event}
 * @constructor
 */
ol.interaction.EditProperties.Event = function(type, feature, mapBrowserEvent) {
  ol.events.Event.call(this, type);

  /**
   * Selected features.
   * @type {ol.Feature}
   * @api
   */
  this.feature = feature;

  /**
   * Associated {@link ol.MapBrowserEvent}.
   * @type {ol.MapBrowserEvent}
   * @api
   */
  this.mapBrowserEvent = mapBrowserEvent;
};
ol.inherits(ol.interaction.EditProperties.Event, ol.events.Event);


/**
 * @enum {string}
 * @private
 */
ol.interaction.EditProperties.EventType = {
  /**
   * Triggered when feature has been selected.
   * @event ol.interaction.EditProperties.Event#select
   * @api
   */
  SELECT: 'select'
};
