var router = require("express").Router();  // eslint-disable-line new-cap
var passport = require("passport");
var Account = require("../models/account");
var RateLimit = require("express-rate-limit");
var async = require("async");
const { checkSchema, validationResult } = require("express-validator/check");
const log = require("loglevel");

// Render the form with error(s) message(s)
function errorRender (req, res, message) {
  req.flash("error", message);
  return res.render("requirePwdReset", {
    email: req.body.email
  });
}

// Render the form with a message
function messageRender (req, res, message) {
  req.flash("info", message);
  return res.render("requirePwdReset");
}

// Force brute protection middleware
var iPLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 10, // start blocking after 5 requests
  delayMs: 0, // disabled
  skipFailedRequests: true,
  handler (req, res, /*next*/) {
    req.flash("error", "Trop de comptes créés simultanément à partir de cette adresse IP, veuillez réessayer plus tard.");
    return res.render("requirePwdReset");
  }
});
//router.use(iPLimiter);

// Schema Validation
var postCheckSchema = checkSchema({
  email: {
    isEmail: {
      errorMessage: "Email incorrect."
    }
  }
});

// Return the form
router.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("requirePwdReset");
  }
});

// Manage the form submission
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

  async.waterfall([
    function(done) {
      require("crypto").randomBytes(20, function(err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      Account.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return errorRender (req, res, "Aucun compte n'existe avec cette adresse e-mail.");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const sgMail = require("@sendgrid/mail");
      if(!process.env.ANCGIS_SENDGRID_API_KEY){
        return errorRender (req, res, "SendGrid n'est pas correctement configuré, veuillez renseigner la clé de l'API.");
      }
      sgMail.setApiKey(process.env.ANCGIS_SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: {
          name: "AncGIS website",
          email: "password.reset@ancgis.dev.net",
        },
        subject: "Votre demande de changement de mot de passe",
        text: "Bonjour,\n\n" +
        "Vous (ou quelqu'un d'autre) avez demandé la réinitialisation de votre mot de passe pour votre compte AncGIS.\n\n" +
          "Veuillez cliquer sur le lien suivant (ou le copier-coller dans votre navigateur) pour terminer le processus:\n\n" +
          "https://" + req.headers.host + "/resetPwd/" + token + "\n\n" +
          "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail, votre mot de passe restera inchangé.\n\n" +
          "L'équipe AncGIS.\n\n"
      };
      sgMail.send(msg, (error, result) => {
        if (error) {
          log.error("ERROR:", error.toString());
          return errorRender (req, res, "Une erreur technique empêche l'envoi de l'email de réinitialisation, veuillez contacter l'administrateur du site.");
        }
        else {
          return messageRender (req, res, "Un email a été envoyé à " + user.email + " avec un lien de réinitialisation.");
        }
      });
    }
  ], function(err) {
    res.redirect("/requirePwdReset");
  });
});

module.exports = router;
