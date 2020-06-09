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

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

exports.addJWTCookie = function (res, user) {
  // create an asymmetric token
  // Note: readFileSync returns a buffer if no encoding is specified.
  // Gets the private key
  var cert = fs.readFileSync(path.join(__dirname, "../../../encryption/ancgis.dev.net.key"), "utf8"); // eslint-disable-line security/detect-non-literal-fs-filename
  var token = jwt.sign({ id: user._id, username: user.username, profil: user.profil }, cert, {
    algorithm: "RS256", // sign with RSA SHA256
    expiresIn: 24 * 60 * 60 // expires in 24 hours (in s)
  });

  // Set a new cookie
  res.cookie("jwt", token, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // expires in 1 year (in ms)
    httpOnly: false,
    secure: true
  });
};

exports.clearJWTCookie = function (res) {
  // Options must be identicals to those given to res.cookie(), excluding expires and maxAge.
  res.clearCookie("jwt", {
    httpOnly: false,
    secure: true
  });
};
