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