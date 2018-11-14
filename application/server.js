#!/usr/bin/env node

/**
 * Module dependencies.
 */
let app = require("./app");
const debug = require("debug")("app:server");

/**
 * Create HTTPS server.
 */
const fs = require("fs");
const spdy = require("spdy");
const options = {
  key: fs.readFileSync("encryption/ancgis.dev.net.key"),
  cert: fs.readFileSync( "encryption/ancgis.dev.net.crt" )
};
let https_server = spdy.createServer(options, app);
https_server.listen(443);
https_server.on("error", onError);
https_server.on("listening", onListening);

/**
 * Create HTTP server which runs alongside HTTPS and will redirect to it.
 */
const http = require("http");
let http_server = http.createServer(app);
http_server.listen(80);

/**
 * Event listener for HTTPS server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  /*
  const addr = https_server.address();
  const port = addr.port;
  const bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;*/
    const bind = "";

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTPS server "listening" event.
 */
function onListening() {
  /*const addr = https_server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;*/
  const bind = "";
  debug("Listening on " + bind);
}
