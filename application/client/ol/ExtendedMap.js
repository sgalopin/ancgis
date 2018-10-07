/**
 * @module ancgis/client/ol/ExtendedMap
 */
import Map from 'ol/Map.js';
import PeriodSwitcherEvent from './control/PeriodSwitcherEvent.js'
import PeriodSwitcherEventType from './control/PeriodSwitcherEventType.js'

/**
 * @classdesc
 * Extends the ol/Map
 * @api
 */
class ExtendedMap extends Map {

  /**
   * @param {import("./PluggableMap.js").MapOptions} options Map options.
   */
  constructor(options) {
    super(options);
  }

  getLayerByName(layerName) {
    return this.getLayers().getArray().find(function(layer) {
      return layer.get("name") === layerName;
    });
  }

  dispatchPeriodPotentialChangeEvent() {
    this.dispatchEvent(new PeriodSwitcherEvent (
      PeriodSwitcherEventType.PERIODPOTENTIALCHANGE,
      this
    ));
  }
}

export default ExtendedMap;