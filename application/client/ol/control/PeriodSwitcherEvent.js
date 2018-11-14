/**
 * @module ancgis/client/ol/control/PeriodSwitcherEvent
 */
import Event from "ol/events/Event.js";

/**
 * @classdesc
 * Events emitted as period switcher events are instances of this type.
 * See {@link module:ol.control.PeriodSwitcher/PeriodSwitcher~PeriodSwitcher} for which events trigger a PeriodSwitcher event.
 */
class PeriodSwitcherEvent extends Event { // Based on the MapEvent

  /**
   * @param {string} type PeriodSwitcher event type.
   * @param {module:ol/PluggableMap} map Map.
   */
  constructor(type, map) {

    super(type);

    /**
     * The map where the event occurred.
     * @type {module:ol/PluggableMap}
     * @api
     */
    this.map = map;

  }
}

export default PeriodSwitcherEvent;