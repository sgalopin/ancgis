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
