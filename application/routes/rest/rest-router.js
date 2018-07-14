var express = require("express");
var passport = require('passport');

module.exports = function (Model, populatePath, returnGeoJson) {
  var router = express.Router(); // eslint-disable-line new-cap
  var returnGeoJson_ = returnGeoJson ? returnGeoJson : false;
  function loggedIn(req, res, next) {
      if (req.isAuthenticated()) {
          next();
      } else {
          res.redirect('/');
      }
  }

  router.route("/")
    // READ ALL
    .get(loggedIn, function(req, res, next) {
      Model.find()
      .populate(populatePath)
      .exec(function (err, docs) {
        if (err) { return console.error(err); }
        if (returnGeoJson_) {
          res.json({
            "type": "FeatureCollection",
            "crs": {
              "type": "name",
              "properties": {
                "name": "EPSG:3857"
              }
            },
            "features": docs
          });
        } else  {
          res.json(docs);
        }
      });
    })
    // CREATE
    .post(loggedIn, function(req, res, next) {
      var doc = new Model(req.body);
      doc.save()
      .then(function (doc) {
        res.json({"status": "success", "data": doc});
      })
      .catch(function(err) {
        res.status(400).json({"status": "fail", "error": err});
      });
    });

  router.route("/:id")
    // READ
    .get(loggedIn, function(req, res, next) {
      Model.findOne({_id: req.params.id})
      .populate(populatePath)
      .exec(function (err, doc) {
        if (err) { return console.error(err); }
        res.json(doc);
      });
    })
    // UPDATE
    .put(loggedIn, function(req, res, next) {
      Model.update({_id: req.params.id}, req.body)
      .exec(function (err, writeOpResult) {
        if (err) { return res.status(400).json({"status": "fail", "error": err}); }
        res.json({"status": "success", "data": writeOpResult});
      });
    })
    // DELETE
    .delete(loggedIn, function(req, res, next) {
      Model.findByIdAndRemove(req.params.id)
      .exec(function (err, doc) {
        if (err) { return res.status(400).json({"status": "fail", "error": err}); }
        res.json({"status": "success", "data": doc});
      });
    });

  return router;
};
