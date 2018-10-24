var express = require("express");
var passport = require('passport');
var jwt = require('jsonwebtoken');
var fs = require("fs");

var router = express.Router(); // eslint-disable-line new-cap

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/jwks.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(require("../encryption/jwks.json"));
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    // The only default info.message from passport-local is 'Missing credentials'
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
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }

      // create an asymmetric token
      // Note: readFileSync returns a buffer if no encoding is specified.
      var cert = fs.readFileSync(__dirname + '/../encryption/ancgis.dev.net.key', 'utf8'); // get private key
      var token = jwt.sign({ id: user._id, username: user.username, profil: user.profil }, cert, {
        algorithm: 'RS256', // sign with RSA SHA256
        expiresIn: 24 * 60 * 60 // expires in 24 hours (in s)
      });

      // Set a new cookie
      res.cookie('jwt', token, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // expires in 1 year (in ms)
        httpOnly: false,
        secure: true
      });
      res.status(200).send({ success: true});
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    // Options must be identicals to those given to res.cookie(), excluding expires and maxAge.
    res.clearCookie('jwt', {
      httpOnly: false,
      secure: true
    });
  }
  res.status(200).send({ success: true});
});

module.exports = router;
