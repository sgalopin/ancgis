/**
 * @module ancgis/client/ancgis/map/ForagingArea
 */

import * as log from "loglevel";
import Feature from "ol/Feature.js";
import Circle from "ol/geom/Circle.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";

/**
 * @classdesc
 * Manage the apiaries's foraging area
 *
 * @api
 */
class ForagingArea {

  /**
   * @param {module:ancgis/client/ancgis/map/ForagingArea~Options=} options Options.
   */
  constructor(options) { // eslint-disable-line complexity
    // Checks the required options
    if (!options.map) {
      throw new Error("MapCache requires a map.");
    }
    if (!options.apiariesLayerName) {
      throw new Error("MapCache requires a apiaries layer name.");
    }
    if (!options.foragingAreasLayerName) {
      throw new Error("MapCache requires a foraging areas layer name.");
    }

    // Sets the class attributs
    this.map = options.map;
    this.apiariesLayerName = options.apiariesLayerName;
    this.foragingAreasLayerName = options.foragingAreasLayerName;
  }

  updateAreas() {
    const self = this;
    const apiariesFeatures = self.map.getLayerByName(self.apiariesLayerName).getSource().getFeatures();
    apiariesFeatures.forEach(function(feature){
      self.updateArea(feature);
    });
  }

  removeOldFeature(foragingAreasLayerSource, feature) {
    let oldFeature = foragingAreasLayerSource.getFeatureById(feature.getId());
    if (oldFeature != null) {
      foragingAreasLayerSource.removeFeature(oldFeature);
    }
  }

  async updateArea(feature, eventType) {
    var ppts = feature.getProperties();
    if (eventType === "delete") {
      let foragingAreasLayerSource = this.map.getLayerByName(this.foragingAreasLayerName).getSource();
      this.removeOldFeature(foragingAreasLayerSource, feature);
    }
    else if (ppts.displayForagingArea) {
      const coordinates = ppts.geometry.flatCoordinates;
      // Get the foragingAreas from the server
      const foragingArea = await this.getForagingArea(coordinates);
      if (foragingArea != null) {
        let foragingAreasLayerSource = this.map.getLayerByName(this.foragingAreasLayerName).getSource();
        this.removeOldFeature(foragingAreasLayerSource, feature);
        foragingArea.setId(feature.getId());
        foragingAreasLayerSource.addFeature(foragingArea);
      }
    }
  }

  getForagingArea(coordinates) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "GET",
        url: "/foraging-area/" + coordinates[0] + "/" + coordinates[1],
        dataType: "json",
        success(response) {
          let extendedGeoJSON = new ExtendedGeoJSON();
          resolve(extendedGeoJSON.readFeature(response.geometry));
        },
        error(jqXHR, textStatus, errorThrown) { // eslint-disable-line complexity
          log.error( "Request Failed with status : " + textStatus );
          if (errorThrown) { log.error(errorThrown); }
          // TODO: Display a message to the user
          resolve(null);
        }
      });
    });
  }

  /* eslint-disable security/detect-object-injection */

  addEventListener(eventType, listener) {
    this.listeners = this.listeners ? this.listeners : {};
    this.listeners[eventType] = this.listeners[eventType] ? this.listeners[eventType] : [];
    this.listeners[eventType].push(listener);
  }

  dispatchEvent(e) {
    let eventType = e.type;
    if (this.listeners && this.listeners[eventType]) {
      this.listeners[eventType].forEach(function(listener) {
        listener.apply(this, e.detail);
      });
    }
  }

  /* eslint-enable security/detect-object-injection */
}

export default ForagingArea;
