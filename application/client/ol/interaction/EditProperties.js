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
    options.handleEvent = handleEvent;

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