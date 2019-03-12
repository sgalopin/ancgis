var express = require("express");
var passport = require("passport");

module.exports = function (Model, populatePath, returnGeoJson, isPrivate) {
  var router = express.Router(); // eslint-disable-line new-cap
  var returnGeoJson_ = returnGeoJson ? returnGeoJson : false;
  var isPrivate_ = isPrivate ? isPrivate : false;

  function loggedIn(req, res, next) {
      if (req.isAuthenticated()) {
          next();
      } else {
          res.redirect("/");
      }
  }
  function checkUser(req, res, next) {
    if (isPrivate_) {
      // For security, compares the submitted account parameter to the current account
      if (!req.body.properties || req.body.properties.account !== req.user._id.toString()) {
        let msg;
        switch(req.method){
          case 'POST': msg = "Création impossible. "; break;
          case 'PUT': msg = "Mise à jour impossible. "; break;
          case 'DELETE': msg = "Suppression impossible. "; break;
        }
        return res.status(403).json({"status": "fail", "error": msg + "La donnée soumise est non attribuée ou attribuée à un autre compte."});
      }
    }
    next();
  }

  router.route("/")
    // READ ALL
    .get(loggedIn, function(req, res, next) {
      // For security, returns only the objects of the current account
      const query = isPrivate_ ? { "properties.account": req.user._id.toString() } : {};
      Model.find(query)
      .populate(populatePath)
      .exec(function (err, docs) {
        if (err) { return res.status(400).json({"status": "fail", "error": err}); }
        if (returnGeoJson_) {
          res.json({
            "type": "FeatureCollection",
            /*"crs": {
              "type": "name",
              "properties": {
                "name": "EPSG:3857"
              }
            },*/
            "features": docs
          });
        } else  {
          res.json(docs);
        }
      });
    })
    // CREATE
    .post(loggedIn, checkUser, function(req, res, next) {
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
      // For security, returns only the object of the current account
      const query = isPrivate_ ? { _id: req.params.id, "properties.account": req.user._id.toString() } : { _id: req.params.id };
      Model.findOne(query)
      .populate(populatePath)
      .exec(function (err, doc) {
        if (err) { return res.status(400).json({"status": "fail", "error": err}); }
        if (!doc) { return res.status(400).json({"status": "fail", "error": "Aucune donnée trouvée."}); }
        res.json(doc);
      });
    })
    // UPDATE
    .put(loggedIn, checkUser, function(req, res, next) {
      const query = isPrivate_ ? { _id: req.params.id, "properties.account": req.user._id.toString() } : { _id: req.params.id };
      Model.findOne(query)
      .exec(function (err, doc) {
        if (err) { return res.status(400).json({"status": "fail", "error": err}); }
        if (!doc) { return res.status(400).json({"status": "fail", "error": "Aucune donnée trouvée."}); }
        // For integrity, compares the submitted timestamp parameter to the timestamp present in the database
        if (!req.body.properties || !req.body.properties.metadata || isNaN(req.body.properties.metadata.timestamp) || req.body.properties.metadata.timestamp <= doc.properties.metadata.timestamp) {
          return res.status(403).json({"status": "fail", "error": "Mise à jour impossible. La donnée soumise est non datée ou plus ancienne que la donnée en base."});
        }
        Model.update({_id: req.params.id}, req.body )
        .exec(function (err, writeOpResult) {
          if (err) { return res.status(400).json({"status": "fail", "error": err}); }
          res.json({"status": "success", "data": writeOpResult});
        });
      });
    })
    // DELETE
    .delete(loggedIn, checkUser, function(req, res, next) {
      const query = isPrivate_ ? { _id: req.params.id, "properties.account": req.user._id.toString() } : { _id: req.params.id };
      Model.findOne(query)
      .exec(function (err, doc) {
        if (err) { return res.status(400).json({"status": "fail", "error": err}); }
        if (!doc) { return res.status(400).json({"status": "fail", "error": "Aucune donnée trouvée."}); }
        // For integrity, compares the submitted timestamp parameter to the timestamp present in the database
        if (!req.body.properties || !req.body.properties.metadata || isNaN(req.body.properties.metadata.timestamp) || req.body.properties.metadata.timestamp <= doc.properties.metadata.timestamp) {
          return res.status(403).json({"status": "fail", "error": "Mise à jour impossible. La donnée soumise est non datée ou plus ancienne que la donnée en base."});
        }
        // For security, clears only the object of the current account
        Model.deleteOne(query)
        .exec(function (err, doc) {
          if (err) { return res.status(400).json({"status": "fail", "error": err}); }
          res.json({"status": "success", "data": doc});
        });
      });
    });

  return router;
};
