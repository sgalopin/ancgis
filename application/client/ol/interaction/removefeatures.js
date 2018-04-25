/*global ol goog*/
goog.provide('ol.interaction.RemoveFeatures');

/**
 * Triggered when feature(s) has been removed.
 * @event ol.interaction.Select.Event#remove
 * @api
 */
ol.interaction.Select.EventType_.REMOVE = 'remove';

/**
 * @classdesc
 * Allows the user to remove the selected features.
 *
 * @constructor
 * @extends {ol.interaction.Select}
 * @param {olx.interaction.RemoveFeaturesOptions=} opt_options Options.
 * @api
 */
ol.interaction.RemoveFeatures = function(opt_options) {

  var options = opt_options || {};
  options.toggleCondition = options.toggleCondition ? options.toggleCondition : ol.events.condition.platformModifierKeyOnly;
  options.handleEvent = ol.interaction.RemoveFeatures.prototype.handleEvent;

  ol.interaction.Select.call(this, options);

  /**
   * True if a listener on the 'keyup' event has been added.
   * @private
   * @type {boolean}
   */
  this.keyuplistening_ = false;

  this.on('select', this.onFeatureSelect_);

};
ol.inherits(ol.interaction.RemoveFeatures, ol.interaction.Select);

/**
 * Removes the selected features.
 * @private
 */
ol.interaction.RemoveFeatures.prototype.removeFeatures_ = function(event) {
  // TODO: don't use anc lib here...
  var ancTool = require('../../anc/tool/modal');
  ancTool.confirm('Confirmez-vous la suppression ?').then(
    $.proxy( function (e) {
      this.getFeatures().forEach(function(feature){
        this.getLayer(feature).getSource().removeFeature(feature);
      }, this);
      this.dispatchEvent(
        new ol.interaction.Select.Event(
          ol.interaction.Select.EventType_.REMOVE,
          this.getFeatures().getArray(),
          [],
          event.mapBrowserEvent
        )
      );
      this.getFeatures().clear();
    }, this ),
    $.proxy( function (e) {
      this.getFeatures().clear();
    }, this )
  );
};

/**
 * Manages the 'select' event.
 * @private
 */
ol.interaction.RemoveFeatures.prototype.onFeatureSelect_ = function(event) {
  if (!ol.events.condition.platformModifierKeyOnly(event.mapBrowserEvent)) { // Control key
    this.removeFeatures_(event);
  } else { // Ctrl key pressed
    if (!this.keyuplistening_) {
      // TODO: use ol event listener to avoid to use JQuery
      $(document).one('keyup', $.proxy(function(e) {
        if (e.keyCode === 17) { // Control key
          this.keyuplistening_ = false;
          this.removeFeatures_(event);
        }
      }, this));
      this.keyuplistening_ = true;
    }
  }
};
