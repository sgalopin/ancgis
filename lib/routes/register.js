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

var router = require("express").Router();  // eslint-disable-line new-cap
var passport = require("passport");
var zxcvbn = require("zxcvbn");
var Account = require("../models/account");
var RateLimit = require("express-rate-limit");
const { checkSchema, validationResult } = require("express-validator/check");
const cookie = require("./tool/cookie");

// Render the register form with error(s) message(s)
function errorRender (req, res, message) {
  req.flash("warning", message);
  return res.render("register", {
    username : req.body.username,
    email: req.body.email,
    profil: req.body.profil
  });
}

// Force brute protection middleware
var iPLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 10, // start blocking after 5 requests
  delayMs: 0, // disabled
  skipFailedRequests: true,
  handler (req, res, /*next*/) {
    req.flash("error", "Trop de comptes créés simultanément à partir de cette adresse IP, veuillez réessayer plus tard.");
    return res.render("register");
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
      options: "fr-FR"
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
      options: [["Agriculteur", "Apiculteur", "Collectivité", "Entomologiste", "Semencier"]]
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
        var passwordScore = zxcvbn(value, user_inputs=[req.body.username, "ancgis", "anc", "gis"]).score; // eslint-disable-line no-undef, camelcase
        if (passwordScore < 2) {
          throw new Error("Le mot de passe est trop faible. Si besoin, vous pouvez l'améliorer <a href=\"https://lowe.github.io/tryzxcvbn/\" target=\"_blank\">ici</a>.");
        }
        // Bug of the v5.2 of express-validator (see: https://github.com/express-validator/express-validator/issues/593)
        return true;
      }
    }
  }
});

// Return the register form
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register");
  }
});

// Manage the register form submission
router.post("/", postCheckSchema, function(req, res, next) {
  // Finds the validation errors in this request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var errorsMessage = "";
    errors.array().forEach(function(element) {
      errorsMessage += errorsMessage === "" ? element.msg : "</br>" + element.msg;
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
  function(err, user) {
    if (err) {
      return errorRender(req, res, err.message);
    }
    passport.authenticate("local")(req, res, function () {
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }
        cookie.addJWTCookie(res, user);
        res.redirect("/");
      });
    });
  });
});

module.exports = router;
