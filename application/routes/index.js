var express = require("express");
var passport = require('passport');
var Account = require('../models/account');

var router = express.Router(); // eslint-disable-line new-cap

router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

router.post('/register', function(req, res, next) {
  Account.register(new Account({
    username : req.body.username
  }),
  req.body.password,
  function(err, account) {
    if (err) {
      return res.render('register', { error : err.message });
    }
    passport.authenticate('local')(req, res, function () {
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
});

router.get('/login', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('login', { user : req.user });
  }
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (! user) {
      return res.render('login', { error : info.message });
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
