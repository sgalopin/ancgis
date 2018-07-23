var express = require("express");
var passport = require('passport');

var router = express.Router(); // eslint-disable-line new-cap

router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

router.get('/login', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('login');
  }
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
      return res.render('login', { username : req.body.username, error: info.message });
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
      res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect('/');
  }
  else {
    res.redirect('/')
  }
});

module.exports = router;
