var router = require("express").Router();
var passport = require('passport');
var zxcvbn = require('zxcvbn');
var Account = require('../models/account');
var RateLimit = require('express-rate-limit');
const { checkSchema, validationResult } = require('express-validator/check');
var jwt = require('jsonwebtoken');
var fs = require("fs");

// Force brute protection middleware
var iPLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 10, // start blocking after 5 requests
  delayMs: 0, // disabled
  skipFailedRequests: true,
  handler: function (req, res, /*next*/) {
    req.flash('error', "Trop de comptes créés simultanément à partir de cette adresse IP, veuillez réessayer plus tard.");
    return res.render('register');
  }
});
//router.use(iPLimiter);

// Schema Validation
var postCheckSchema = checkSchema({
  username: {
    trim: {},
    isLength: {
      errorMessage: "Le nom d'utilisateur doit être supérieur à 5 lettres.",
      options: { min: 5 }
    },
    isAlphanumeric: {
      errorMessage: "Le nom d'utilisateur doit être de type alphanumérique.",
      options: 'fr-FR'
    }
  },
  email: {
    isEmail: {
      errorMessage: "Email incorrect."
    }
  },
  profil: {
    isIn: {
      errorMessage: "Profil incorrect.",
      options: [['Agriculteur', 'Apiculteur', 'Collectivité', 'Entomologiste', 'Semencier']]
    }
  },
  password: {
    not: {},
    isEmpty: {
      errorMessage: "Le mot de passe doit être renseigné."
    },
    matches: {
      errorMessage: "Le mot de passe contient des caractères interdits.",
      options: "^[a-zA-Z0-9_$@$!%*#?&\\.\\-]*$"
    },
    custom: {
      options: (value, { req, location, path }) => {
        var passwordScore = zxcvbn(value, user_inputs=[req.body.username, 'ancgis', 'anc', 'gis']).score;
        if (passwordScore < 2) {
          throw new Error('Le mot de passe est trop faible. Si besoin, vous pouvez l\'améliorer <a href="https://lowe.github.io/tryzxcvbn/" target="_blank">ici</a>.');
        }
        // Bug of the v5.2 of express-validator (see: https://github.com/express-validator/express-validator/issues/593)
        return true;
      }
    }
  }
});

// Return the register form
router.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

// Manage the register form submission
router.post('/', postCheckSchema, function(req, res, next) {

  // Finds the validation errors in this request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var errorsMessage = "";
    errors.array().forEach(function(element) {
      errorsMessage += errorsMessage === "" ? element.msg : '</br>' + element.msg;
    });
    return errorRender(req, res, errorsMessage);
  }

  // Register the new account
  Account.register(new Account({
    username : req.body.username,
    email: req.body.email,
    profil: req.body.profil,
  }),
  req.body.password,
  function(err, account) {
    if (err) {
      return errorRender(req, res, err.message);
    }
    passport.authenticate('local')(req, res, function () {
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }

        // create an asymmetric token
        // TODO: Make a function to create the token and the cookie
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

        res.redirect('/');
      });
    });
  });
});

// Render the register form with error(s) message(s)
function errorRender (req, res, message) {
  req.flash('warning', message);
  return res.render('register', {
    username : req.body.username,
    email: req.body.email,
    profil: req.body.profil
  });
}

module.exports = router;
