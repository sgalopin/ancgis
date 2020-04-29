#!/usr/bin/env node

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
