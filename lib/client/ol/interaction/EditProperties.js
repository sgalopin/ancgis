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
 * @module ancgis/client/ol/interaction/EditProperties
 */

import Interaction from "ol/interaction/Interaction.js";
import MapBrowserEventType from "ol/MapBrowserEventType.js";
import EditPropertiesEvent from "./EditPropertiesEvent.js";
import EditPropertiesEventType from "./EditPropertiesEventType.js";

/**
 * @classdesc
 * Allows the user to edit the properties of the selected feature.
 *
 * @api
 */
class EditProperties extends Interaction {
  /**
   * @param {module:ol/interaction/EditProperties~Options=} optOptions Options.
   */
  constructor(optOptions) {

    const options = optOptions ? optOptions : {};
    options.handleEvent = handleEvent; // eslint-disable-line no-use-before-define

    super(options);
  }
}

/**
 * Handles the {@link module:ol/MapBrowserEvent map browser event}
 * to eventually display the zone properties form.
 * @param {module:ol/MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {module:ol/interaction/EditProperties}
 * @api
 */
export function handleEvent(mapBrowserEvent) {
  // On right click only
  if ((mapBrowserEvent.type === MapBrowserEventType.POINTERDOWN
    && mapBrowserEvent.pointerEvent.button === 2)
    || mapBrowserEvent.type === MapBrowserEventType.DBLCLICK) {
    mapBrowserEvent.preventDefault();
    var map = mapBrowserEvent.map;
    var feature = map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
      function(feature, layer) {
          return feature;
      },{
        layerFilter(layerCandidate) {
          // Checks if the layer has a name (Avoids the selection of the drawing layers).
          if (layerCandidate.getProperties().hasOwnProperty("name")) {
            return true;
          } else {
            return false;
          }
        }
      }
    );
    if (feature) {
      this.dispatchEvent(
        new EditPropertiesEvent(
          EditPropertiesEventType.SELECT,
          feature,
          mapBrowserEvent
        )
      );
    }

    return false;
  }

  return true;
}

export default EditProperties;
