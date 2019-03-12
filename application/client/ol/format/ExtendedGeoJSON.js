/* eslint-disable no-use-before-define, no-undefined, security/detect-object-injection */

/**
 * @module ol/format/ExtendedGeoJSON
 */
// TODO: serialize dataProjection as crs member when writing
// see https://github.com/openlayers/openlayers/issues/2078

import {assert} from "ol/asserts.js";
import Feature from "ol/Feature.js";
import {transformWithOptions} from "ol/format/Feature.js";
import JSONFeature from "ol/format/JSONFeature.js";
import GeometryCollection from "ol/geom/GeometryCollection.js";
import LineString from "ol/geom/LineString.js";
import MultiLineString from "ol/geom/MultiLineString.js";
import MultiPoint from "ol/geom/MultiPoint.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import Point from "ol/geom/Point.js";
import Polygon from "ol/geom/Polygon.js";
import {assign, isEmpty} from "ol/obj.js";
import {get as getProjection} from "ol/proj.js";


/**
 * @typedef {Object} Options
 * @property {module:ol/proj~ProjectionLike} [dataProjection="EPSG:4326"] Default data projection.
 * @property {module:ol/proj~ProjectionLike} [featureProjection] Projection for features read or
 * written by the format.  Options passed to read or write methods will take precedence.
 * @property {string} [geometryName] Geometry name to use when creating features.
 * @property {boolean} [extractGeometryName=false] Certain GeoJSON providers include
 * the geometry_name field in the feature GeoJSON. If set to `true` the GeoJSON reader
 * will look for that field to set the geometry name. If both this field is set to `true`
 * and a `geometryName` is provided, the `geometryName` will take precedence.
 */


/**
 * @classdesc
 * Feature format for reading and writing data in the GeoJSON format.
 *
  * @api
 */
class ExtendedGeoJSON extends JSONFeature {

  /**
   * @param {module:ol/format/GeoJSON~Options=} optOptions Options.
   */
  constructor(optOptions) {

    const options = optOptions ? optOptions : {};

/******************************************************************************/
/*************************** Addon ANCGIS *************************************/
/******************************************************************************/

    options.featureProjection = "EPSG:3857";
    options.dataProjection = "EPSG:4326";

/******************************************************************************/
/*************************** Addon ANCGIS *************************************/
/******************************************************************************/

    super();
    
    /**
     * @inheritDoc
     */
    this.dataProjection = getProjection(
      options.dataProjection ?
        options.dataProjection : "EPSG:4326");

    if (options.featureProjection) {
      this.defaultFeatureProjection = getProjection(options.featureProjection);
    }

    /**
     * Name of the geometry attribute for features.
     * @type {string|undefined}
     * @private
     */
    this.geometryName_ = options.geometryName;

    /**
     * Look for the geometry name in the feature GeoJSON
     * @type {boolean|undefined}
     * @private
     */
    this.extractGeometryName_ = options.extractGeometryName;

  }

  /**
   * @inheritDoc
   */
  readFeatureFromObject(object, optOptions) {
    /**
     * @type {GeoJSONFeature}
     */
    let geoJSONFeature = null;
    if (object.type === "Feature") {
      geoJSONFeature = /** @type {GeoJSONFeature} */ (object);
    } else {
      geoJSONFeature = /** @type {GeoJSONFeature} */ ({
        type: "Feature",
        geometry: /** @type {GeoJSONGeometry|GeoJSONGeometryCollection} */ (object)
      });
    }

    const geometry = readGeometry(geoJSONFeature.geometry, optOptions);
    const feature = new Feature();
    if (this.geometryName_) {
      feature.setGeometryName(this.geometryName_);
    } else if (this.extractGeometryName_ && geoJSONFeature.geometry_name !== undefined) {
      feature.setGeometryName(geoJSONFeature.geometry_name);
    }
    feature.setGeometry(geometry);
    if (geoJSONFeature.id !== undefined) {
      feature.setId(geoJSONFeature.id);
    }
    if (geoJSONFeature.properties) {
      feature.setProperties(geoJSONFeature.properties);
    }
    return feature;
  }

  /**
   * @inheritDoc
   */
  readFeaturesFromObject(object, optOptions) {
    const geoJSONObject = /** @type {GeoJSONObject} */ (object);
    /** @type {Array<module:ol/Feature>} */
    let features = null;
    if (geoJSONObject.type === "FeatureCollection") {
      const geoJSONFeatureCollection = /** @type {GeoJSONFeatureCollection} */ (object);
      features = [];
      const geoJSONFeatures = geoJSONFeatureCollection.features;
      for (let i = 0, ii = geoJSONFeatures.length; i < ii; ++i) {
        features.push(this.readFeatureFromObject(geoJSONFeatures[i], optOptions));
      }
    } else {
      features = [this.readFeatureFromObject(object, optOptions)];
    }
    return features;
  }

  /**
   * @inheritDoc
   */
  readGeometryFromObject(object, optOptions) {
    return readGeometry(/** @type {GeoJSONGeometry} */ (object), optOptions);
  }

  /**
   * @inheritDoc
   */
  readProjectionFromObject(object) {
    const geoJSONObject = /** @type {GeoJSONObject} */ (object);
    const crs = geoJSONObject.crs;
    let projection;
    if (crs) {
      if (crs.type === "name") {
        projection = getProjection(crs.properties.name);
      } else {
        assert(false, 36); // Unknown SRS type
      }
    } else {
      projection = this.dataProjection;
    }
    return (
      /** @type {module:ol/proj/Projection} */ (projection)
    );
  }

  /**
   * Encode a feature as a GeoJSON Feature object.
   *
   * @param {module:ol/Feature} feature Feature.
   * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
   * @return {GeoJSONFeature} Object.
   * @override
   * @api
   */
  writeFeatureObject(feature, optOptions) {
    optOptions = this.adaptOptions(optOptions);

    const object = /** @type {GeoJSONFeature} */ ({
      "type": "Feature"
    });
    const id = feature.getId();
    if (id !== undefined) {
      object.id = id;
    }
    const geometry = feature.getGeometry();
    if (geometry) {
      object.geometry = writeGeometry(geometry, optOptions);
    } else {
      object.geometry = null;
    }
    const properties = feature.getProperties();
    delete properties[feature.getGeometryName()];
    if (!isEmpty(properties)) {
      object.properties = properties;
    } else {
      object.properties = null;
    }
    return object;
  }

  /**
   * Encode an array of features as a GeoJSON object.
   *
   * @param {Array<module:ol/Feature>} features Features.
   * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
   * @return {GeoJSONFeatureCollection} GeoJSON Object.
   * @override
   * @api
   */
  writeFeaturesObject(features, optOptions) {
    optOptions = this.adaptOptions(optOptions);
    const objects = [];
    for (let i = 0, ii = features.length; i < ii; ++i) {
      objects.push(this.writeFeatureObject(features[i], optOptions));
    }
    return /** @type {GeoJSONFeatureCollection} */ ({
      type: "FeatureCollection",
      features: objects
    });
  }

  /**
   * Encode a geometry as a GeoJSON object.
   *
   * @param {module:ol/geom/Geometry} geometry Geometry.
   * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
   * @return {GeoJSONGeometry|GeoJSONGeometryCollection} Object.
   * @override
   * @api
   */
  writeGeometryObject(geometry, optOptions) {
    return writeGeometry(geometry, this.adaptOptions(optOptions));
  }
}


/******************************************************************************/
/*************************** Addon CIRCLE *************************************/
/******************************************************************************/

// Based on ol/format/GeoJSON v5.2.0

import Circle from "ol/geom/Circle.js";

/**
 * @const
 * @type {Object<string, function(GeoJSONObject): module:ol/geom/Geometry>}
 */
const GEOMETRY_READERS = {
  "Point": readPointGeometry,
  "LineString": readLineStringGeometry,
  "Polygon": readPolygonGeometry,
  "MultiPoint": readMultiPointGeometry,
  "MultiLineString": readMultiLineStringGeometry,
  "MultiPolygon": readMultiPolygonGeometry,
  "GeometryCollection": readGeometryCollectionGeometry,
  "Circle": readCircleGeometry
};

/**
 * @const
 * @type {Object<string, function(module:ol/geom/Geometry, module:ol/format/Feature~WriteOptions=): (GeoJSONGeometry|GeoJSONGeometryCollection)>}
 */
const GEOMETRY_WRITERS = {
  "Point": writePointGeometry,
  "LineString": writeLineStringGeometry,
  "Polygon": writePolygonGeometry,
  "MultiPoint": writeMultiPointGeometry,
  "MultiLineString": writeMultiLineStringGeometry,
  "MultiPolygon": writeMultiPolygonGeometry,
  "GeometryCollection": writeGeometryCollectionGeometry,
  "Circle": writeCircleGeometry
};

/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/Circle} Circle.
 */
function readCircleGeometry(object) {
  return new Circle(object.coordinates, object.radius);
}

/**
 * @param {module:ol/geom/Circle} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeCircleGeometry(geometry, optOptions) {
  return /** @type {GeoJSONGeometry} */ ({
    type: "Circle",
    coordinates: geometry.getCenter(),
    radius: geometry.getRadius()
  });
}

/******************************************************************************/
/*************************** Addon CIRCLE *************************************/
/******************************************************************************/


/**
 * @param {GeoJSONGeometry|GeoJSONGeometryCollection} object Object.
 * @param {module:ol/format/Feature~ReadOptions=} optOptions Read options.
 * @return {module:ol/geom/Geometry} Geometry.
 */
function readGeometry(object, optOptions) {
  if (!object) {
    return null;
  }
  const geometryReader = GEOMETRY_READERS[object.type];
  return (
    /** @type {module:ol/geom/Geometry} */ (transformWithOptions(geometryReader(object), false, optOptions))
  );
}


/**
 * @param {GeoJSONGeometryCollection} object Object.
 * @param {module:ol/format/Feature~ReadOptions=} optOptions Read options.
 * @return {module:ol/geom/GeometryCollection} Geometry collection.
 */
function readGeometryCollectionGeometry(object, optOptions) {
  const geometries = object.geometries.map(
    /**
     * @param {GeoJSONGeometry} geometry Geometry.
     * @return {module:ol/geom/Geometry} geometry Geometry.
     */
    function(geometry) {
      return readGeometry(geometry, optOptions);
    });
  return new GeometryCollection(geometries);
}


/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/Point} Point.
 */
function readPointGeometry(object) {
  return new Point(object.coordinates);
}


/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/LineString} LineString.
 */
function readLineStringGeometry(object) {
  return new LineString(object.coordinates);
}


/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/MultiLineString} MultiLineString.
 */
function readMultiLineStringGeometry(object) {
  return new MultiLineString(object.coordinates);
}


/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/MultiPoint} MultiPoint.
 */
function readMultiPointGeometry(object) {
  return new MultiPoint(object.coordinates);
}


/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/MultiPolygon} MultiPolygon.
 */
function readMultiPolygonGeometry(object) {
  return new MultiPolygon(object.coordinates);
}


/**
 * @param {GeoJSONGeometry} object Object.
 * @return {module:ol/geom/Polygon} Polygon.
 */
function readPolygonGeometry(object) {
  return new Polygon(object.coordinates);
}


/**
 * @param {module:ol/geom/Geometry} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry|GeoJSONGeometryCollection} GeoJSON geometry.
 */
function writeGeometry(geometry, optOptions) {
  const geometryWriter = GEOMETRY_WRITERS[geometry.getType()];
  return geometryWriter(/** @type {module:ol/geom/Geometry} */ (
    transformWithOptions(geometry, true, optOptions)), optOptions);
}


/**
 * @param {module:ol/geom/Geometry} geometry Geometry.
 * @return {GeoJSONGeometryCollection} Empty GeoJSON geometry collection.
 */
function writeEmptyGeometryCollectionGeometry(geometry) {
  return /** @type {GeoJSONGeometryCollection} */ ({
    type: "GeometryCollection",
    geometries: []
  });
}


/**
 * @param {module:ol/geom/GeometryCollection} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometryCollection} GeoJSON geometry collection.
 */
function writeGeometryCollectionGeometry(geometry, optOptions) {
  const geometries = geometry.getGeometriesArray().map(function(geometry) {
    const options = assign({}, optOptions);
    delete options.featureProjection;
    return writeGeometry(geometry, options);
  });
  return /** @type {GeoJSONGeometryCollection} */ ({
    type: "GeometryCollection",
    geometries
  });
}


/**
 * @param {module:ol/geom/LineString} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeLineStringGeometry(geometry, optOptions) {
  return /** @type {GeoJSONGeometry} */ ({
    type: "LineString",
    coordinates: geometry.getCoordinates()
  });
}


/**
 * @param {module:ol/geom/MultiLineString} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeMultiLineStringGeometry(geometry, optOptions) {
  return /** @type {GeoJSONGeometry} */ ({
    type: "MultiLineString",
    coordinates: geometry.getCoordinates()
  });
}


/**
 * @param {module:ol/geom/MultiPoint} geometry Geometry.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeMultiPointGeometry(geometry) {
  return /** @type {GeoJSONGeometry} */ ({
    type: "MultiPoint",
    coordinates: geometry.getCoordinates()
  });
}


/**
 * @param {module:ol/geom/MultiPolygon} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writeMultiPolygonGeometry(geometry, optOptions) {
  let right;
  if (optOptions) {
    right = optOptions.rightHanded;
  }
  return /** @type {GeoJSONGeometry} */ ({
    type: "MultiPolygon",
    coordinates: geometry.getCoordinates(right)
  });
}


/**
 * @param {module:ol/geom/Point} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writePointGeometry(geometry, optOptions) {
  return /** @type {GeoJSONGeometry} */ ({
    type: "Point",
    coordinates: geometry.getCoordinates()
  });
}


/**
 * @param {module:ol/geom/Polygon} geometry Geometry.
 * @param {module:ol/format/Feature~WriteOptions=} optOptions Write options.
 * @return {GeoJSONGeometry} GeoJSON geometry.
 */
function writePolygonGeometry(geometry, optOptions) {
  let right;
  if (optOptions) {
    right = optOptions.rightHanded;
  }
  return /** @type {GeoJSONGeometry} */ ({
    type: "Polygon",
    coordinates: geometry.getCoordinates(right)
  });
}


export default ExtendedGeoJSON;
