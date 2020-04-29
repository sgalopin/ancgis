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
 * @module ancgis/client/ol/interaction/EditPropertiesEvent
 */

import Event from "ol/events/Event.js";

/**
 * @classdesc
 * Events emitted as EditProperties events are instances of this type.
 * See {@link module:ol.interaction.EditProperties/EditProperties~EditProperties} for which events trigger a EditProperties event.
 */
class EditPropertiesEvent extends Event { // Based on the MapEvent

  /**
   * @param {string} type EditProperties event type.
   * @param {module:ol/Feature} feature Selected feature.
   * @param {module:ol/MapBrowserEvent} mapBrowserEvent Associated.
   */
  constructor(type, feature, mapBrowserEvent) {

    super(type);

    /**
     * The selected features.
     * @type {module:ol/Feature}
     * @api
     */
    this.feature = feature;

    /**
     * The associated {@link module:ol/MapBrowserEvent}.
     * @type {module:ol/MapBrowserEvent}
     * @api
     */
    this.mapBrowserEvent = mapBrowserEvent;

  }

}

export default EditPropertiesEvent;
