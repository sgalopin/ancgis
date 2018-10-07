/**
 * @module ancgis/client/ol/interaction/RemoveFeatures
 */
import RemoveFeatureEventType from './RemoveFeaturesEventType.js'
import Select from 'ol/interaction/Select.js';
import {platformModifierKeyOnly} from 'ol/events/condition.js';
import Event from 'ol/events/Event.js';
import {confirm} from "../../ancgis/tool/modal.js";

/**
 * @classdesc
 * Events emitted by {@link module:ol/interaction/Select~Select} instances are instances of
 * this type.
 */
class SelectEvent extends Event {
  /**
   * @param {SelectEventType} type The event type.
   * @param {Array<module:ol/Feature>} selected Selected features.
   * @param {Array<module:ol/Feature>} deselected Deselected features.
   * @param {module:ol/MapBrowserEvent} mapBrowserEvent Associated
   *     {@link module:ol/MapBrowserEvent}.
   */
  constructor(type, selected, deselected, mapBrowserEvent) {
    super(type);

    /**
     * Selected features array.
     * @type {Array<module:ol/Feature>}
     * @api
     */
    this.selected = selected;

    /**
     * Deselected features array.
     * @type {Array<module:ol/Feature>}
     * @api
     */
    this.deselected = deselected;

    /**
     * Associated {@link module:ol/MapBrowserEvent}.
     * @type {module:ol/MapBrowserEvent}
     * @api
     */
    this.mapBrowserEvent = mapBrowserEvent;
  }
}

/**
 * @classdesc
 * Allows the user to remove the selected features.
 *
 * @api
 */
class RemoveFeatures extends Select {
  /**
   * @param {module:ol/interaction/RemoveFeatures~Options=} opt_options Options.
   */
  constructor(opt_options) {

    const options = opt_options ? opt_options : {};
    options.toggleCondition = options.toggleCondition ? options.toggleCondition : platformModifierKeyOnly;

    super(options);

    /**
     * True if a listener on the "keyup" event has been added.
     * @private
     * @type {boolean}
     */
    this.keyuplistening_ = false;

    this.on("select", this.onFeatureSelect_);
  }

  /**
   * Removes the selected features.
   * @param {module:ol/interaction/SelectEvent} event A modify event.
   * @private
   */
  removeFeatures_(event) {
    // TODO: don't use ancgis lib here...
    confirm("Confirmez-vous la suppression ?").then(
      $.proxy( function (e) {
        var me = this;
        this.getFeatures().forEach(function(feature){
          me.getLayer(feature).getSource().removeFeature(feature);
        });
        // Dispatch a remove event for remote deletion
        this.dispatchEvent(
          new SelectEvent(
            RemoveFeatureEventType.REMOVE,
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
  }

  /**
   * Manages the "select" event.
   * @param {module:ol/interaction/SelectEvent} event A modify event.
   * @private
   */
  onFeatureSelect_(event) {
    if (!this.toggleCondition_(event.mapBrowserEvent)) { // Control key
      this.removeFeatures_(event);
    } else { // Ctrl key pressed
      if (!this.keyuplistening_) {
        // TODO: use ol event listener to avoid to use JQuery
        $(document).one("keyup", $.proxy(function(e) {
          if (e.keyCode === 17) { // Control key
            this.keyuplistening_ = false;
            this.removeFeatures_(event);
          }
        }, this));
        this.keyuplistening_ = true;
      }
    }
  }
}

export default RemoveFeatures;