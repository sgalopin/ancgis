/**
 * AncGIS - Web GIS for the analysis of honey resources around an apiary
 * Copyright (C) 2020  Sylvain Galopin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @module ancgis/client/ol/ExtendedMap
 */

import Map from "ol/Map.js";
import PeriodSwitcherEvent from "./control/PeriodSwitcherEvent.js";
import PeriodSwitcherEventType from "./control/PeriodSwitcherEventType.js";
import {get as olProjGet} from "ol/proj.js";
import VectorLayer from "ol/layer/Vector.js";
import LayerGroup from "ol/layer/Group.js"
import PointerEvent from 'ol/pointer/PointerEvent.js';
import MapBrowserPointerEvent from 'ol/MapBrowserPointerEvent.js';

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

  getLayerByName(layerName, node= null) {
    let map = this, wanted_child = null;
    if (node === null) { node = map; }
    node.getLayers().getArray().find(function(child) {
      if (child instanceof LayerGroup) {
        wanted_child = map.getLayerByName(layerName, child);
        if (wanted_child !== null) { return; }
      } else if(child.get("name") === layerName) {
        wanted_child = child;
        return;
      }
    });
    return wanted_child;
  }

  getFeatures() {
    let features = [];
    this.getLayers().getArray().forEach(function(layer){
      if (layer instanceof VectorLayer) {
        layer.getSource().getFeatures().forEach(function(feature){
          features.push(feature);
        });
      }
    });
    return features;
  }

  getFeatureById(id) {
    return this.getFeatures().find(function(feature) {
      return feature.getId() === id;
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

  // See (ol5) openlayers/test/spec/ol/interaction/draw.test.js
  // https://github.com/openlayers/openlayers/blob/master/test/spec/ol/interaction/draw.test.js
  /**
   * Simulates a browser event on the map viewport.  The client x/y location
   * will be adjusted as if the map were centered at 0,0.
   * @param {string} type Event type.
   * @param {number} x Horizontal offset from map center.
   * @param {number} y Vertical offset from map center.
   * @param {object} viewportSize The viewport size (ex:{ width: 1280, height: 1024 }).
   * @param {boolean=} opt_shiftKey Shift key is pressed.
   * @return {module:ol/MapBrowserPointerEvent} The simulated event.
   */
  simulateEvent(type, x, y, viewportSize, opt_shiftKey) {
    let self = this;
    const viewport = self.getViewport();
    // calculated in case body has top < 0 (test runner with small window)
    const position = viewport.getBoundingClientRect();
    const shiftKey = (typeof optShiftKey !== "undefined") ? optShiftKey : false;
    const event = new PointerEvent(type, {
      clientX: position.left + x + viewportSize.width / 2,
      clientY: position.top + y + viewportSize.height / 2,
      shiftKey: shiftKey,
      preventDefault: function() {}
    }, {
      pointerType: 'mouse'
    });
    const simulatedEvent = new MapBrowserPointerEvent(type, self, event);
    self.handleMapBrowserEvent(simulatedEvent);
    return simulatedEvent;
  }
}

export default ExtendedMap;
