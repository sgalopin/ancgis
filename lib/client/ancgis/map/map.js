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

 /*global ol*/

// ol import
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import LayerGroup from "ol/layer/Group.js"
import Style from "ol/style/Style.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
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
import LayerSwitcher from "../../ol/control/LayerSwitcher.js"
import PeriodSwitcher from "../../ol/control/PeriodSwitcher.js";
import PeriodSwitcherEvent from "../../ol/control/PeriodSwitcherEvent.js";
import PeriodSwitcherEventType from "../../ol/control/PeriodSwitcherEventType.js";

/**
 * Map builder.
 */
export default async function(hivesLayerName, vegetationsLayerName, extentsLayerName, errorsLayerName, bdorthoLayerName, scanLayerName, isOnline) {

  let extendedGeoJSON = new ExtendedGeoJSON();

  // Hives layer
  var hivesLayerSource = new VectorSource({
    wrapX: false,
    format: extendedGeoJSON
  });
  var hivesLayer = new VectorLayer({
    title: 'Ruches',
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
    title: 'Végétations',
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
          text += species.taxon.name.latin.short + "\n"
          + species.taxon.periods.blooming.calendar + "\n"
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
    title: 'Zones de cache cartographique',
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

  // Tile Grid
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

  // BDORTHO layer
  var bdorthoLayerSource = new WMTSSource({
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
    title: 'Photos aériennes',
    type: 'base', // Required by LayerSwitcher
    name: bdorthoLayerName,
    source: bdorthoLayerSource
  });

  // SCAN-EXPRESS layer
  var scanLayerSource = new WMTSSource({
    url: "https://wxs.ign.fr/" + key + "/wmts",
    layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD",
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

  var scanLayer = new TileLayer({
    title: 'Scan express',
    type: 'base', // Required by LayerSwitcher
    name: scanLayerName,
    source: scanLayerSource
  });

  // Layers groups
  let vectorLayersGroup = new LayerGroup({
    title: 'Données',
    fold: 'open',
    layers: [hivesLayer, vegetationsLayer]
  });

  let layers = [
    new LayerGroup({
      title: 'Fonds',
      fold: 'open',
      layers: [bdorthoLayer, scanLayer]
    }),
    vectorLayersGroup
  ];
  if (isOnline) {
    vectorLayersGroup.getLayers().push(extentsLayer);
  }
  layers.push(errorsLayer); // The errors layer must be placed to the top.

  return new ExtendedMap ({ // Openlayers Map
    layers,
    target: "ancgis-map",
    keyboardEventTarget: document,
    controls: [
      new LayerSwitcher({
        tipLabel: 'Légende',
        groupSelectStyle: 'group'
    }),
      new PeriodSwitcher({periodType: "calendar"}),
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
