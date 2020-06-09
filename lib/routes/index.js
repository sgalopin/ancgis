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

var express = require("express");
var passport = require("passport");
const cookie = require("./tool/cookie");

var router = express.Router(); // eslint-disable-line new-cap

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/jwks.json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(require("../encryption/jwks.json"));
});

router.get("/status", function(req, res, next) {
  if (req.isAuthenticated()) {
      cookie.addJWTCookie(res,req.user);
      return res.status(200).send({ success: true, activeSession: true});
  } else {
      return res.status(200).send({ success: true, activeSession: false});
  }
});

router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    // The only default info.message from passport-local is "Missing credentials"
    // See: https://github.com/jaredhanson/passport-local/blob/master/lib/strategy.js
    badRequestMessage: "Mot de passe ou nom d'utilisateur manquant."
  }, function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (! user) {
      return res.status(200).send({ success: false, message: info.message});
    }
    // ***********************************************************************
    // "Note that when using a custom callback, it becomes the application's
    // responsibility to establish a session (by calling req.login()) and send
    // a response."
    // Source: http://passportjs.org/docs
    // ***********************************************************************
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      cookie.addJWTCookie(res, user);
      res.status(200).send({ success: true});
    });
  })(req, res, next);
});

router.get("/logout", function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    cookie.clearJWTCookie(res);
  }
  res.status(200).send({ success: true});
});

router.get("/unregister", function(req, res) {
  if (req.isAuthenticated()) {
    const Account = require("../models/account");
    Account.deleteOne({ _id: req.user._id.toString() })
    .exec(function (err, doc) {
      if (err) { return res.status(400).json({"status": "fail", "error": err}); }
      req.logout();
      cookie.clearJWTCookie(res);
      res.json({"success": true});
    });
  } else {
    res.json({ success: false, message: "Not authenticated."});
  }
});

module.exports = router;
