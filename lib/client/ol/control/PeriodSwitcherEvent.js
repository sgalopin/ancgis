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
