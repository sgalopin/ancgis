var express = require("express");
var exphbs  = require("express-handlebars");
var mongoose = require("mongoose");
var sassMiddleware = require("node-sass-middleware");
var browserify = require("browserify-middleware");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var index = require("./routes/index");
var users = require("./routes/users");
var taxons = require("./routes/rest/taxons");
var vegetationZones = require("./routes/rest/vegetation-zones");
var hives = require("./routes/rest/hives");

var app = express();

// view engine setup
app.engine("hbs", exphbs({extname: ".hbs", defaultLayout: "layout"}));
app.set("view engine", "hbs");
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
mongoose.connect(dbConnectionString + "/taxons");
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

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);
app.use("/users", users);
app.use("/rest/taxons", taxons);
app.use("/rest/vegetation-zones", vegetationZones);
app.use("/rest/hives", hives);

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
