/**
 * @module ancgis/client/ol/ExtendedMap
 */
import Map from 'ol/Map.js';
import PeriodSwitcherEvent from './control/PeriodSwitcherEvent.js'
import PeriodSwitcherEventType from './control/PeriodSwitcherEventType.js'
import {get as olProjGet} from 'ol/proj.js'

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

  //[minx, miny, maxx, maxy]
  getExtendTilesUrls(extend, source) {
    const tileUrlFunction = source.getTileUrlFunction();
    const grid = source.getTileGrid();
    let urls = [];
    for (let z = grid.getMinZoom(), max = grid.getMaxZoom(); z <= max; z++) {
      grid.forEachTileCoord(extend, z, function(tileCoord){
        urls.push(tileUrlFunction(tileCoord, 1, olProjGet("EPSG:3857")));
      });
    }
    return urls;
  }

  /**
   * Add the given interactions to the map.
   * @param {module:ol/interaction/Interaction} interactions Interactions to add.
   * @api
   */
  addInteractions(interactions) {
    let self = this;
    interactions = Array.isArray(interactions) ? interactions : [interactions];
    interactions.forEach(function(interaction) {
      self.getInteractions().push(interaction);
    });
  }

  /**
   * Remove the given interactions from the map.
   * @param {module:ol/interaction/Interaction} interactions Interactions to remove.
   * @return {module:ol/interaction/Interaction|undefined} The removed interactions (or
   *     undefined if the interaction was not found).
   * @api
   */
  removeInteractions(interactions) {
    let self = this, removedInteractions = [];
    interactions = Array.isArray(interactions) ? interactions : [interactions];
    interactions.forEach(function(interaction) {
      removedInteractions.push(self.getInteractions().remove(interaction));
    });
    return removedInteractions;
  }
}

export default ExtendedMap;