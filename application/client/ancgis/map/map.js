/*global ol*/

// ol import
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";
import Text from "ol/style/Text.js";
import Circle from "ol/geom/Circle.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
import WMTSSource from "ol/source/WMTS.js";
import TileLayer from "ol/layer/Tile.js";
import Attribution from "ol/control/Attribution.js";
import ZoomSlider from "ol/control/ZoomSlider.js";
import ScaleLine from "ol/control/ScaleLine.js";
import MousePosition from "ol/control/MousePosition.js";
import {format as coordinateFormat} from "ol/coordinate.js";
import View from "ol/View.js";
import {get as olProjGet} from "ol/proj.js";
import {getWidth as olExtentGetWidth} from "ol/extent.js";

// Local import
import ExtendedMap from "../../ol/ExtendedMap.js";
import ExtendedGeoJSON from "../../ol/format/ExtendedGeoJSON.js";
import PeriodSwitcher from "../../ol/control/PeriodSwitcher.js";
import PeriodSwitcherEvent from "../../ol/control/PeriodSwitcherEvent.js";
import PeriodSwitcherEventType from "../../ol/control/PeriodSwitcherEventType.js";

/**
 * Map builder.
 */
export default async function(apiariesLayerName, hivesLayerName, vegetationsLayerName, extentsLayerName, errorsLayerName, bdorthoLayerName, isOnline) {

  let extendedGeoJSON = new ExtendedGeoJSON();

  // Apiaries layer
  var apiariesLayerSource = new VectorSource({
    wrapX: false,
    format: extendedGeoJSON
  });
  var apiariesLayer = new VectorLayer({
    name: apiariesLayerName,
    source: apiariesLayerSource,
    style(feature) {
      var ppts = feature.getProperties();
      var text = "?";
      if (ppts.registrationNumber && ppts.registrationNumber != null) {
        text = ppts.registrationNumber;
      }
      return new Style({
        fill: new Fill({
          color: "red"
        }),
        stroke: new Stroke({
          color: "black",
          width: 2
        }),
        text: new Text({ text }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      });
    }
  });

  // Hives layer
  var hivesLayerSource = new VectorSource({
    wrapX: false,
    format: extendedGeoJSON
  });
  var hivesLayer = new VectorLayer({
    name: hivesLayerName,
    source: hivesLayerSource,
    style(feature) {
      var ppts = feature.getProperties();
      var text = "?";
      if (ppts.registrationNumber && ppts.registrationNumber != null) {
        text = "N°" + ppts.registrationNumber;
      }
      return new Style({
        fill: new Fill({
          color: "gray"
        }),
        stroke: new Stroke({
          color: "black",
          width: 2
        }),
        text: new Text({ text })
      });
    }
  });

  // Vegetations layer
  var vegetationsLayerSource = new VectorSource({
    wrapX: false,
    format: extendedGeoJSON
  });
  var vegetationsLayer = new VectorLayer({
    name: vegetationsLayerName,
    source: vegetationsLayerSource,
    style(feature) {
      var ppts = feature.getProperties();

      // Style stroke and fill
      var styles = {
        "Polygon": new Style({
          stroke: new Stroke({
            color: "black",
            width: 2
          }),
          fill: new Fill({
            color: "rgba(255, 255, 0, 0.1)"
          })
        }),
        "Circle": new Style({
          stroke: new Stroke({
            color: "black",
            //lineDash: [4],
            width: 2
          }),
          fill: new Fill({
            color: "rgba(0,255,0,0.1)"
          })
        })
      };

      // Style text
      let text = "?";
      if (ppts.flore) {
        ppts.flore.forEach(function(species, i) {
          if (i === 0) {
            text = "";
          } else {
            text += "\n\n";
          }
          text += species.taxon.vernacularName + "\n"
          + species.taxon.periods + "\n"
          + species.recovery + "%";
        });
      }
      text = new Text({ text });
      styles.Polygon.setText(text);
      styles.Circle.setText(text);

      return styles[feature.getGeometry().getType()];
    }
  });

  // Extents Layer
  var extentsLayerSource = new VectorSource({
    wrapX: false,
    format: extendedGeoJSON
  });
  var extentsLayer = new VectorLayer({
    name: extentsLayerName,
    source: extentsLayerSource,
    style(feature) {
      return new Style({
        stroke: new Stroke({
          color: "black",
          width: 3
        })
      });
    }
  });

  // Errors Layer
  var errorsLayer = new VectorLayer({
    name: errorsLayerName,
    source: new VectorSource(),
    style(feature) {
      return new Style({
        stroke: new Stroke({
          color: "red",
          width: 3
        })
      });
    }
  });

  // BDORTHO layer
  var resolutions = [];
  var matrixIds = [];
  var proj3857 = olProjGet("EPSG:3857");
  var maxResolution = olExtentGetWidth(proj3857.getExtent()) / 256;

  for (var i = 0; i < 18; i++) {
    matrixIds[i] = i.toString(); // eslint-disable-line security/detect-object-injection
    resolutions[i] = maxResolution / Math.pow(2, i); // eslint-disable-line security/detect-object-injection
  }

  var tileGrid = new WMTSTileGrid({
    origin: [-20037508, 20037508],
    resolutions,
    matrixIds
  });

  var key = "7wbodpc2qweqkultejkb47zv";

  var ignSource = new WMTSSource({
    url: "https://wxs.ign.fr/" + key + "/wmts",
    //layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS",
    layer: "ORTHOIMAGERY.ORTHOPHOTOS",
    matrixSet: "PM",
    format: "image/jpeg",
    projection: "EPSG:3857",
    tileGrid,
    style: "normal"/*, TODO: update this to openlayers 5
    attributions: [new ol.Attribution({
      html: "<a href=\"http://www.geoportail.fr/\" target=\"_blank\">" +
        "<img src=\"https://api.ign.fr/geoportail/api/js/latest/" +
        "theme/geoportal/img/logo_gp.gif\"></a>"
    })]*/
  });

  var bdorthoLayer = new TileLayer({
    name: bdorthoLayerName,
    source: ignSource
  });

  let layers = [bdorthoLayer, apiariesLayer, hivesLayer, vegetationsLayer];
  if (isOnline) { layers.push(extentsLayer); }
  layers.push(errorsLayer); // The errors layer must be placed to the top.

  return new ExtendedMap ({ // Openlayers Map
    layers,
    target: "ancgis-map",
    keyboardEventTarget: document,
    controls: [
      new PeriodSwitcher(),
      new Attribution(),
      new ZoomSlider(),
      new ScaleLine(),
      new MousePosition({
        className:"",
        target:document.getElementById("ancgis-mapstatus-mouseposition"),
        coordinateFormat(coords) {
          var template = "X: {x} - Y: {y} ";
          return coordinateFormat(coords, template);
      }})
    ],
    view: new View({
      zoom: 6,
      //center: ol.proj.transform([5, 45], "EPSG:4326", "EPSG:3857")
      center: [250000, 5910000] // France's center
    })
  });
}
