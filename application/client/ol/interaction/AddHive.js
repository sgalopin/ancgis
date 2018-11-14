/**
 * @module ancgis/client/ol/interaction/AddHive
 */
 import Interaction from "ol/interaction/Interaction.js";
 import EventType from "ol/events/EventType.js";
 import Feature from "ol/Feature.js";
 import {getChangeEventType} from "ol/Object.js";
 import {listen} from "ol/events.js";
 import Event from "ol/events/Event.js"
 import {platformModifierKeyOnly, pointerMove, singleClick} from "ol/events/condition.js";
 import {TRUE, FALSE} from "ol/functions.js";
 import Polygon from "ol/geom/Polygon.js";
 import InteractionProperty from "ol/interaction/Property.js";
 import VectorLayer from "ol/layer/Vector.js";
 import VectorSource from "ol/source/Vector.js";
 import {DEVICE_PIXEL_RATIO, FIREFOX, SAFARI} from "ol/has.js";

/**
* @typedef {Object} Options
* @property {module:ol/events/condition~Condition} [condition] A function that
* takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
* boolean to indicate whether that event should be handled.
* By default {@link module:ol/events/condition~platformModifierKeyOnly}
* @property {module:ol/source/Vector} [source] Destination source for
* the drawn features.
* @property {boolean} [wrapX=false] Wrap the world horizontally on the sketch
* overlay.
*/

/**
 * @classdesc
 * Allows the user to orient (by scrolling the mouse wheel) and add a hive on the map.
 *
 * @api
 */
class AddHive extends Interaction { // Based on the Draw Interaction
  /**
   * @param {module:ol/interaction/AddHive~Options=} opt_options Options.
   */
  constructor(opt_options) {

    super({
      handleEvent: handleEvent
    });

    const options = opt_options ? opt_options : {};

    /**
     * Rotation angle in radians.
     * @type {number}
     * @private
     */
    this.angle_ = 0;

    /**
     * Draw overlay where our sketch features are drawn.
     * @type {module:ol/layer/Vector}
     * @private
     */
    this.overlay_ = new VectorLayer({
      source: new VectorSource({
          useSpatialIndex: false,
          wrapX: options.wrapX ? options.wrapX : false
      })
    });

    /**
     * Target source for drawn features.
     * @type {module:ol/source/Vector}
     * @private
     */
    this.source_ = options.source ? options.source : null;

    /**
     * @private
     * @type {module:ol/events/condition~Condition}
     */
    this.condition_ = options.condition ? options.condition : platformModifierKeyOnly;

    listen(this,
      getChangeEventType(InteractionProperty.ACTIVE),
      this.updateState_, this);
  }

  /**
   * Create a square on the coordinate.
   * @param {number=} angle Rotation angle in radians.
   * @param {number=} coordinate The mouse coordinates.
   * @return {module:ol/Feature} The feature.
   * @private
   */
  getSquareFromCoordinate_(angle, coordinate){
    var x = coordinate[0];
    var y = coordinate[1];
    // A ring must be closed, that is its last coordinate
    // should be the same as its first coordinate.
    var ring = [[x-0.4,y-0.4],[x+0.4,y-0.4],[x+0.4,y+0.4],[x-0.4,y+0.4],[x-0.4,y-0.4]];
    // A polygon is an array of rings, the first ring is
    // the exterior ring, the others are the interior rings.
    // In your case there is one ring only.
    var polygon = new Polygon([ring]);
    polygon.rotate(angle, coordinate);
    // Create feature with polygon.
    return new Feature(polygon);
  }

  /**
   * @inheritDoc
   */
  setMap(map) { // Copied from the Draw Interaction
    super.setMap(map);
    this.updateState_();
  }

  /**
   * @private
   */
  updateState_() { // Copied from the Draw Interaction
    const map = this.getMap();
    const active = this.getActive();
    if (!map || !active) {
      this.abortDrawing_();
    }
    this.overlay_.setMap(active ? map : null);
  }

  /**
   * Stop drawing without adding the sketch feature to the target layer.
   * @private
   */
  abortDrawing_() { // Based on the Draw Interaction
    this.overlay_.getSource().clear(true);
  }
}

/**
 * Handles the {@link module:ol/MapBrowserEvent map browser event}
 * to eventually add a hive on the map.
 * @param {module:ol/MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {module:ol/interaction/AddHive}
 * @api
 */
export function handleEvent(mapBrowserEvent) {  // Based on the MouseWheelZoom Interaction
  if (mapBrowserEvent.originalEvent.type === EventType.CONTEXTMENU) {
    // Avoid context menu for long taps when drawing on mobile
    mapBrowserEvent.preventDefault();
  }
  var overlaySource = this.overlay_.getSource();
  if (pointerMove(mapBrowserEvent)){
    overlaySource.clear(true);
    overlaySource.addFeature(this.getSquareFromCoordinate_(this.angle_, mapBrowserEvent.coordinate));
    return false;
  } else if (singleClick(mapBrowserEvent)){
    this.source_.addFeature(this.getSquareFromCoordinate_(this.angle_, mapBrowserEvent.coordinate));
    return false;
  } else if (this.condition_(mapBrowserEvent) && (mapBrowserEvent.type === EventType.WHEEL || mapBrowserEvent.type === EventType.MOUSEWHEEL)) {
    mapBrowserEvent.preventDefault();
    // Delta normalisation inspired by
    // https://github.com/mapbox/mapbox-gl-js/blob/001c7b9/js/ui/handler/scroll_zoom.js
    const wheelEvent = /** @type {WheelEvent} */ (mapBrowserEvent.originalEvent);
    let delta;
    if (mapBrowserEvent.type == EventType.WHEEL) {
      delta = wheelEvent.deltaY;
      if (FIREFOX &&
          wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        delta /= DEVICE_PIXEL_RATIO;
      }
      if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        delta *= 40;
      }
    } else if (mapBrowserEvent.type == EventType.MOUSEWHEEL) {
      delta = -wheelEvent.wheelDeltaY;
      if (SAFARI) {
        delta /= 3;
      }
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
}

export default AddHive;