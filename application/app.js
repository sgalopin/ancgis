const result = require("dotenv").config();
if (result.error) { throw result.error; }

var express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
var exphbs  = require("express-handlebars");
var passport = require("passport");
var mongoose = require("mongoose");
var sassMiddleware = require("node-sass-middleware");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var RateLimit = require("express-rate-limit");
var flash = require("express-flash");
const log = require("loglevel");

var app = express();

// HTTP to HHTPS redirection
app.use(function(req, res, next) {
  if (req.secure) {
    next();
  } else {
    res.redirect("https://" + req.headers.host + req.url);
  }
});

// view engine setup
app.engine("hbs", exphbs({
  extname: ".hbs",
  defaultLayout: "layout",
  layoutsDir: __dirname + "/views/layouts/",
  helpers: {
    ifEqual: require("./views/helpers/ifEqual.js"),
    substr: require("./views/helpers/substr.js")
  },
  partialsDir: [
    __dirname + "/views/partials/"
  ]
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

var dbConnectionString = process.env.MONGODB_URI || "mongodb://localhost/ancgis";
mongoose.connect(dbConnectionString, { useNewUrlParser: true });
mongoose.set("useCreateIndex", true); // Removes DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.

if (process.env.NODE_ENV === "development") {
  // webpack-dev-middleware
  const webpack = require("webpack");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackConfig = require("./webpack.config.js");
  const compiler = webpack(webpackConfig);
  // Tell express to use the webpack-dev-middleware and use the webpack.config.js
  // configuration file as a base.
  app.use(webpackDevMiddleware(compiler, {
    noInfo: false,
    publicPath: webpackConfig.output.publicPath,
    writeToDisk: true
  }));
  // BrowserSync
  const browserSync = require("browser-sync");
  const browserSyncConfig = {
   files: [webpackConfig.output.path + "/*.bundle.js", "sass/**/*.scss"],
    logLevel: "debug",
    logSnippet: false,
    //reloadDelay: 3000,
    reloadOnRestart: true,
    https: {
        key: "encryption/ancgis.dev.net.key",
        cert: "encryption/ancgis.dev.net.crt"
    },
    online: false
  };
  const bs = browserSync(browserSyncConfig);
  app.use(require("connect-browser-sync")(bs));
}

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

// Session management
app.set("trust proxy", 1); // trust first proxy
app.use(session({
  secret: process.env.ANCGIS_SESSION_SECRET ? process.env.ANCGIS_SESSION_SECRET : require("crypto").randomBytes(64).toString("hex"),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
  store: new MongoStore({ mongooseConnection: mongoose.connection }) // Re-use the existing MongoDB connection.
}));
app.use(flash()); // Flash requires sessions.

// Authentication with Passport (local)
// In a Express-based application, passport.initialize() middleware is required to initialize Passport.
app.use(passport.initialize());
// In application using persistent login sessions, passport.session() middleware must also be used.
app.use(passport.session());
// requires the model with Passport-Local Mongoose plugged in
const Account = require("./models/account");
// use static authenticate method of model in LocalStrategy
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(Account.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Force brute protection middleware
var loginIPLimiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: 100,
  delayMs: 0, // disabled
  handler (req, res, /*next*/) {
    return res.render("login", { error : "Trop de tentatives de connexion à partir de cette adresse IP, veuillez réessayer plus tard." });
  }
});
var loginUserLimiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: 10,
  delayMs: 0, // disabled
  handler (req, res, /*next*/) {
    return res.render("login", { username : req.body.username, error : "Trop de tentatives de connexion pour cet utilisateur, veuillez réessayer plus tard." });
  },
  keyGenerator (req) {
    return req.body.username;
  }
});
//app.use("/login", loginUserLimiter);
//app.use("/login", loginIPLimiter);

// Routes (must be declared after the session)
var index = require("./routes/index");
app.use("/", index);
app.use("/register", require("./routes/register"));
app.use("/requirePwdReset", require("./routes/requirePwdReset"));
app.use("/resetPwd", require("./routes/resetPwd"));
app.use("/rest/taxons", require("./routes/rest/taxons"));
app.use("/rest/vegetation-zones", require("./routes/rest/vegetation-zones"));
app.use("/rest/apiaries", require("./routes/rest/apiaries"));
app.use("/rest/hives", require("./routes/rest/hives"));
app.use("/rest/extents", require("./routes/rest/extents"));

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
  res.locals.error = process.env.NODE_ENV === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
