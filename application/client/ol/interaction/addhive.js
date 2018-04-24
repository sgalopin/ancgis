/*global ol*/
goog.provide('ol.interaction.AddHive');

goog.require('ol');
goog.require('ol.ViewHint');
goog.require('ol.easing');
goog.require('ol.events.EventType');
goog.require('ol.has');
goog.require('ol.interaction.Interaction');
goog.require('ol.math');


/**
 * @classdesc
 * Allows the user to orient (by scrolling the mouse wheel) and add a hive on the map.
 *
 * @constructor
 * @extends {ol.interaction.Interaction}
 * @param {olx.interaction.AddHiveOptions=} opt_options Options.
 * @api
 */
ol.interaction.AddHive = function(opt_options) {

  ol.interaction.Interaction.call(this, {
  handleEvent: ol.interaction.AddHive.handleEvent
  });

    var options = opt_options || {};

  /**
   * Rotation angle in radians.
   * @private
   * @type {number}
   */
  this.angle_ = 0;

  /**
   * Draw overlay where our sketch features are drawn.
   * @type {ol.layer.Vector}
   * @private
   */
  this.overlay_ = new ol.layer.Vector({
    source: new ol.source.Vector({
        useSpatialIndex: false,
        wrapX: options.wrapX ? options.wrapX : false
    })
    //,style: options.style ? options.style : ol.interaction.Draw.getDefaultStyleFunction()
  });

  /**
   * Target source for drawn features.
   * @type {ol.source.Vector}
   * @private
   */
  this.source_ = options.source ? options.source : null;

  /**
   * The condition to rotate the polygon (default:'ol.events.condition.platformModifierKeyOnly')
   * @private
   * @type {ol.EventsConditionType}
   */
  this.condition_ = options.condition ? options.condition : ol.events.condition.platformModifierKeyOnly;

  ol.events.listen(this,
      ol.Object.getChangeEventType(ol.interaction.Property.ACTIVE),
      this.updateState_, this);

};
ol.inherits(ol.interaction.AddHive, ol.interaction.Interaction);

/**
 * Handles the {@link ol.MapBrowserEvent map browser event}
 * to eventually add a hive on the map.
 * @param {ol.MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} Allow event propagation.
 * @this {ol.interaction.AddHive}
 * @api
 */
ol.interaction.AddHive.handleEvent = function(mapBrowserEvent) {
  var type = mapBrowserEvent.type;
  var overlaySource = this.overlay_.getSource();

  if (ol.events.condition.pointerMove(mapBrowserEvent)){
    overlaySource.clear(true);
    overlaySource.addFeature(this.getSquareFromCoordinate_(this.angle_, mapBrowserEvent.coordinate));
    return false;
  } else if (ol.events.condition.singleClick(mapBrowserEvent)){
    this.source_.addFeature(this.getSquareFromCoordinate_(this.angle_, mapBrowserEvent.coordinate));
    return false;
  } else if (this.condition_(mapBrowserEvent) && (type === ol.events.EventType.WHEEL || type === ol.events.EventType.MOUSEWHEEL)) {
    mapBrowserEvent.preventDefault();

    // Delta normalisation inspired by
    // https://github.com/mapbox/mapbox-gl-js/blob/001c7b9/js/ui/handler/scroll_zoom.js
    var delta;
    var wheelEvent = /** @type {WheelEvent} */ (mapBrowserEvent.originalEvent);
    if (type === ol.events.EventType.WHEEL) {
      delta = wheelEvent.deltaY;
    } else if (type === ol.events.EventType.MOUSEWHEEL) {
      delta = -wheelEvent.wheelDeltaY;
    }

    // One full turn equals 2π radians, 360 degrees, 400 grades.
     var increment = (2 *Math.PI) / 32;
    if (delta === 0) {
      return true;
    } else if (delta < 0) {
      increment *= -1;
    }

    this.angle_ += increment;

    overlaySource.clear(true);
    overlaySource.addFeature(this.getSquareFromCoordinate_(this.angle_, mapBrowserEvent.coordinate));

    return false;
  }
  return true;
};

/**
 * @private
 */
ol.interaction.AddHive.prototype.getSquareFromCoordinate_ = function (angle, coordinate){
  var x = coordinate[0];
  var y = coordinate[1];
  // A ring must be closed, that is its last coordinate
  // should be the same as its first coordinate.
  var ring = [[x-0.4,y-0.4],[x+0.4,y-0.4],[x+0.4,y+0.4],[x-0.4,y+0.4],[x-0.4,y-0.4]];
  // A polygon is an array of rings, the first ring is
  // the exterior ring, the others are the interior rings.
  // In your case there is one ring only.
  var polygon = new ol.geom.Polygon([ring]);
  polygon.rotate(angle, coordinate);
  // Create feature with polygon.
  return new ol.Feature(polygon);
};

/**
 * @inheritDoc
 */
ol.interaction.AddHive.prototype.setMap = function(map) {
  ol.interaction.Interaction.prototype.setMap.call(this, map);
  this.updateState_();
};

/**
 * @private
 */
ol.interaction.AddHive.prototype.updateState_ = function() {
  var map = this.getMap();
  var active = this.getActive();
  if (!map || !active) {
    this.abortDrawing_();
  }
  this.overlay_.setMap(active ? map : null);
};

/**
 * Stop drawing without adding the sketch feature to the target layer.
 * @private
 */
ol.interaction.AddHive.prototype.abortDrawing_ = function() {
    this.overlay_.getSource().clear(true);
};
