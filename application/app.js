const result = require('dotenv').config();
if (result.error) { throw result.error; }

var express = require("express");
var session = require('express-session');
var exphbs  = require("express-handlebars");
var passport = require('passport');
var mongoose = require("mongoose");
var sassMiddleware = require("node-sass-middleware");
var browserify = require("browserify-middleware");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var RateLimit = require('express-rate-limit');
var flash = require('express-flash');

var app = express();

// view engine setup
app.use(flash());
const handlebarsHelpers = require('./helpers/handlebars');
app.engine("hbs", exphbs({
  extname: ".hbs",
  defaultLayout: "layout",
  layoutsDir: __dirname + '/views/layouts/',
  helpers: handlebarsHelpers
}));
app.set("view engine", "hbs");
// Note: you must place sass-middleware *before* `express.static` or else it will not work.
app.use (
  sassMiddleware({
    src: __dirname + "/sass",
    dest: __dirname + "/public",
    debug: true,
  })
);
browserify.settings({ transform: ["hbsfy"] });
app.get("/javascripts/bundle.js", browserify("./client/main.js"));
var dbConnectionString = process.env.MONGODB_URI || "mongodb://localhost/ancgis";
mongoose.connect(dbConnectionString + "/taxons", function(err) {
  if (err) {
    console.log('Could not connect to mongodb on localhost. Ensure that you have mongodb running on localhost and mongodb accepts connections on standard ports!');
  }
});
if (app.get("env") === "development") {
  var browserSync = require("browser-sync");
  var config = {
   files: ["public/**/*.{js,css}", "client/*.js", "sass/**/*.scss", "views/**/*.hbs"],
    logLevel: "debug",
    logSnippet: false,
    //reloadDelay: 3000,
    reloadOnRestart: true,
    https: {
        key: "encryption/ancgis.dev.net.key",
        cert: "encryption/ancgis.dev.net.crt"
    }
  };
  var bs = browserSync(config);
  app.use(require("connect-browser-sync")(bs));
}

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

// Session management
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.ANCGIS_SESSION_SECRET ? process.env.ANCGIS_SESSION_SECRET : require('crypto').randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// Authentication with Passport
// In a Express-based application, passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize());
// In application using persistent login sessions, passport.session() middleware must also be used.
app.use(passport.session());
// requires the model with Passport-Local Mongoose plugged in
const Account = require('./models/account');
// use static authenticate method of model in LocalStrategy
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(Account.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// HTTP to HHTPS redirection
app.use(function(req, res, next) {
  if (req.secure) {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});

// Force brute protection middleware
var loginIPLimiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: 100,
  delayMs: 0, // disabled
  handler: function (req, res, /*next*/) {
    return res.render('login', { error : "Trop de tentatives de connexion à partir de cette adresse IP, veuillez réessayer plus tard." });
  }
});
var loginUserLimiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: 10,
  delayMs: 0, // disabled
  handler: function (req, res, /*next*/) {
    return res.render('login', { username : req.body.username, error : "Trop de tentatives de connexion pour cet utilisateur, veuillez réessayer plus tard." });
  },
  keyGenerator: function (req) {
    return req.body.username;
  }
});
//app.use("/login", loginUserLimiter);
//app.use("/login", loginIPLimiter);

// Routes (must be declared after the session)
var index = require("./routes/index");
app.use("/", index);
app.use("/login", index);
app.use("/logout", index);
app.use("/register", require("./routes/register"));
app.use("/requirePwdReset", require("./routes/requirePwdReset"));
app.use("/resetPwd", require("./routes/resetPwd"));
app.use("/rest/taxons", require("./routes/rest/taxons"));
app.use("/rest/vegetation-zones", require("./routes/rest/vegetation-zones"));
app.use("/rest/hives", require("./routes/rest/hives"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
