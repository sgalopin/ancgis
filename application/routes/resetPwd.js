var router = require("express").Router();
var passport = require("passport");
var zxcvbn = require("zxcvbn");
var Account = require("../models/account");
var RateLimit = require("express-rate-limit");
const { checkSchema, validationResult } = require("express-validator/check");

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
        var passwordScore = zxcvbn(value, user_inputs=["ancgis", "anc", "gis"]).score;
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
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
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

// Render the form with error(s) message(s)
function errorRender (req, res, message) {
  req.flash("error", message);
  return res.render("resetPwd");
}

module.exports = router;
