#!/usr/bin/env node

/**
 * Module dependencies.
 */
let app = require("./app");
const debug = require("debug")("app:server");
const log = require("loglevel");

/**
 * Create HTTPS server.
 * The https server is configured only for the development virtual machine context.
 * Heroku automatically creates and configures its own https server.
 */
let httpsServer = null;
if (JSON.parse(process.env.SET_HTTPS_SERVER)) {
  const fs = require("fs");
  const spdy = require("spdy");
  const options = {
    key: fs.readFileSync("encryption/ancgis.dev.net.key"),
    cert: fs.readFileSync( "encryption/ancgis.dev.net.crt" )
  };
  httpsServer = spdy.createServer(options, app);
  httpsServer.listen(443);
  httpsServer.on("error", onHttpsError); // eslint-disable-line no-use-before-define
  httpsServer.on("listening", onHttpsListening); // eslint-disable-line no-use-before-define
}

/**
 * Create HTTP server which runs alongside HTTPS and will redirect to it.
 * process.env.HTTP_SERVER_PORT is used in the development virtual machine context.
 * process.env.PORT is used in the heroku context.
 */
const http = require("http");
let httpServer = http.createServer(app);
httpServer.listen(process.env.HTTP_SERVER_PORT || process.env.PORT || 80);

/**
 * Event listener for HTTPS server "error" event.
 */
function onHttpsError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const addr = httpsServer.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      log.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      log.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTPS server "listening" event.
 */
function onHttpsListening() {
    const addr = httpsServer.address();
    const bind = typeof addr === "string"
      ? "pipe " + addr
      : "port " + addr.port;
    console.log("Listening on " + bind);
}
