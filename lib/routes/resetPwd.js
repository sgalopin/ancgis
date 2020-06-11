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

// Render the form with error(s) message(s)
function errorRender (req, res, message) {
  req.flash("error", message);
  return res.render("resetPwd");
}

// Force brute protection middleware
var iPLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 10, // start blocking after 5 requests
  delayMs: 0, // disabled
  skipFailedRequests: true,
  handler (req, res, /*next*/) {
    req.flash("error", "Trop de comptes créés simultanément à partir de cette adresse IP, veuillez réessayer plus tard.");
    return res.render("resetPwd");
  }
});
//router.use(iPLimiter);

// Schema Validation
var postCheckSchema = checkSchema({
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
        // TODO: Add the req.user.username to the user_inputs like in register form
        var passwordScore = zxcvbn(value, user_inputs=["ancgis", "anc", "gis"]).score; // eslint-disable-line no-undef, camelcase
        if (passwordScore < 2) {
          throw new Error("Le mot de passe est trop faible. Si besoin, vous pouvez l'améliorer <a href=\"https://lowe.github.io/tryzxcvbn/\" target=\"_blank\">ici</a>.");
        }
        // Bug of the v5.2 of express-validator (see: https://github.com/express-validator/express-validator/issues/593)
        return true;
      }
    }
  },
  confirmation: {
      custom: {
        options: (value, { req, location, path }) => {
          if (value !== req.body.password) {
            throw new Error("La confirmation du mot de passe ne correspond pas.");
          }
          // Bug of the v5.2 of express-validator (see: https://github.com/express-validator/express-validator/issues/593)
          return true;
        }
      }
    }
});

// Return the form
router.get("/:token", function(req, res) {
  Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash("error", "Le jeton pour la réinitialisation du mot de passe est invalide ou a expiré.");
      return res.redirect("/requirePwdReset");
    }
    res.render("resetPwd");
  });
});

// Manage the form submission
router.post("/:token", postCheckSchema, function(req, res, next) {

  // Finds the validation errors in this request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var errorsMessage = "";
    errors.array().forEach(function(element) {
      errorsMessage += errorsMessage === "" ? element.msg : "</br>" + element.msg;
    });
    return errorRender(req, res, errorsMessage);
  }

  Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash("error", "Le jeton pour la réinitialisation du mot de passe est invalide ou a expiré.");
      return res.redirect("back");
    }
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.setPassword(req.body.password, function(){
      user.save(function(err) {
        req.logIn(user, function(err) {
          req.flash("success", "Votre mot de passe a été changé avec succès.");
          res.redirect("/");
        });
      });
    });
  });
});

module.exports = router;
