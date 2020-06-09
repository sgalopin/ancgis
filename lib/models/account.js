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
 
var mongoose = require("mongoose");
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");

// Model's declaration
var Account = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    profil: {type: String, required: true},
    password: String, // don't set required to true for password (is set by passport after creation)
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
// See: https://github.com/saintedlama/passport-local-mongoose
Account.plugin(passportLocalMongoose, {
  iterations: 100000, // Specifies the number of iterations used in pbkdf2 hashing algorithm.
  // Note: limitAttempts and maxAttempts are redundant with the force brute protection middleware (see app.js)
  // limitAttempts: Specifies whether login attempts should be limited and login failures should be penalized. Default: false.
  // maxAttempts: Specifies the maximum number of failed attempts allowed before preventing login. Default: Infinity.
  errorMessages: {
    MissingPasswordError: "Aucun mot de passe n'a été donné.",
    AttemptTooSoonError: "Le compte est actuellement verrouillé. Réessayez plus tard.",
    TooManyAttemptsError: "Compte bloqué en raison d'un trop grand nombre de tentatives de connexion infructueuses.",
    NoSaltValueStoredError: "L'authentification n'est pas possible. Aucune valeur de sel stockée.",
    IncorrectPasswordError: "Mot de passe ou nom d'utilisateur incorrect.",
    IncorrectUsernameError: "Mot de passe ou nom d'utilisateur incorrect.",
    MissingUsernameError: "Aucun nom d'utilisateur n'a été donné.",
    UserExistsError: "Un utilisateur avec le même nom est déjà enregistré."
  }
});
module.exports = mongoose.model("Account", Account);
