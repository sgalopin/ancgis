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
    // Get the extents of the current account
    const query = { "properties.account": req.user._id.toString() };
    extentsModel.find(query)
    .exec(function (err, userExtents) {
      if (err) {
        console.log("err",err);
        return res.status(400).json({"status": "fail", "error": err});
      }
      // Get the pedoclimatic zones intersecting the user's extents
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
        res.json({
          "type": "FeatureCollection",
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "features": pcZones
        });
      });
    });
  });

module.exports = router;
