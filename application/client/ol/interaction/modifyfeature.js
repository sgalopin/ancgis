/*global ol goog*/
goog.provide('ol.interaction.ModifyFeature');

/**
 * Triggered upon feature modification end
 * @event ol.interaction.Modify.Event#modifyfeatures
 * @api
 */
ol.interaction.ModifyEventType.MODIFYFEATURES = 'modifyfeatures';

/**
 * @classdesc
 * Allows the user to modify the selected feature.
 *
 * @constructor
 * @extends {ol.interaction.Modify}
 * @param {olx.interaction.ModifyFeatureOptions=} opt_options Options.
 * @api
 */
ol.interaction.ModifyFeature = function(opt_options) {

  var options = opt_options || {};
  options.deleteCondition = options.deleteCondition ? options.deleteCondition : function(mapBrowserEvent) {
    return ol.events.condition.platformModifierKeyOnly(mapBrowserEvent) &&
      ol.events.condition.singleClick(mapBrowserEvent);
  };
  options.handleEvent = ol.interaction.ModifyFeature.prototype.handleEvent;

  ol.interaction.Modify.call(this, options);

  /**
   * The collection of the last changed features
   * @type {ol.Collection}
   * @private
   */
  this.changedFeatures_ = new ol.Collection([],true);

  this.on(ol.interaction.ModifyEventType.MODIFYEND, this.onModifyEnd_);
  this.on(ol.interaction.ModifyEventType.MODIFYSTART, this.onModifyStart_);
};
ol.inherits(ol.interaction.ModifyFeature, ol.interaction.Modify);

/**
 * Manages the 'modifyend' event.
 * NOTE: The returned 'modifyend' event features contains all the features.
 * We have to create an other event returning only the modified features.
 * @private
 */
ol.interaction.ModifyFeature.prototype.onModifyEnd_ = function(event) {
  this.features_.forEach(function(feature){
    feature.un(ol.events.EventType.CHANGE, this.addChangedFeature_, this);
  }, this);
  this.dispatchEvent(new ol.interaction.Modify.Event(ol.interaction.ModifyEventType.MODIFYFEATURES, this.changedFeatures_, event));
};

/**
 * Manages the 'modifystart' event.
 * @private
 */
ol.interaction.ModifyFeature.prototype.onModifyStart_ = function(event) {
  this.changedFeatures_.clear();
  this.features_.forEach(function(feature){
    feature.once(ol.events.EventType.CHANGE, this.addChangedFeature_, this);
  }, this);
};

/**
 * Add the changed feature to the 'changedFeatures_' collection.
 * @private
 */
ol.interaction.ModifyFeature.prototype.addChangedFeature_ = function(e) {
  this.changedFeatures_.push(e.target)
};
