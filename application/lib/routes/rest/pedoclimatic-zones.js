const turf = require('@turf/turf');
const uuidv1 = require("uuid/v1");
var pedoclimaticZonesModel = require("../../models/pedoclimatic-zones");
var extentsModel = require("../../models/extents");
var express = require("express");
var passport = require("passport");
var router = express.Router(); // eslint-disable-line new-cap

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
}

router.route("/")
  // READ ALL
  .get(loggedIn, function(req, res, next) {
    // Gets the extents of the current account
    const query = { "properties.account": req.user._id.toString() };
    extentsModel.find(query)
    .exec(function (err, userExtents) {
      if (err) {
        console.log("err",err);
        return res.status(400).json({"status": "fail", "error": err});
      }
      if (userExtents.length === 0){ // TODO: test this case
        msg = "No user's extents found.";
        console.log(msg);
        return res.json({
          "type": "FeatureCollection",
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "features": []
        });
      }
      // Gets the pedoclimatic zones intersecting the user's extents
      const subQuery = {
        "geometry": {
          "$geoIntersects": {
            "$geometry": {
              type: "MultiPolygon" ,
              coordinates: userExtents.map(x => x.geometry.coordinates)
      }}}};
      pedoclimaticZonesModel.find(subQuery).exec(function (err, pcZones) {
        if (err) {
          console.log("err",err);
          return res.status(400).json({"status": "fail", "error": err});
        }
        // Gets the shared areas between zones and extents
        areas = [];
        userExtents.forEach(function(userExtent){
          pcZones.forEach(function(pcZone){
            const area = turf.intersect(userExtent.geometry, pcZone.geometry);
            if (area != null) {
              // TODO: test the case with two overlapping extents (sharing the same pcZones)
              if(area.geometry.type === 'MultiPolygon') {
                // Note: Turf intersect function do not support MultiPolygon
                area.geometry.coordinates.forEach(function(coordinate){
                  // clone and set new id
                  let pcZoneCopy = JSON.parse(JSON.stringify(pcZone));
                  // TODO: Refactor the id setting?
                  pcZoneCopy.id = uuidv1()
                  pcZoneCopy.geometry.coordinates = coordinate;
                  areas.push(pcZoneCopy);
                })
              } else { // Polygon
                pcZone.geometry = area.geometry
                areas.push(pcZone);
              }
            }
          });
        });
        res.json({
          "type": "FeatureCollection",
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "features": areas
        });
      });
    });
  });

module.exports = router;
