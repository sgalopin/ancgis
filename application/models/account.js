// Requirements
var mongoose = require("mongoose");
var passport = require('passport');
var passportLocalMongoose = require('passport-local-mongoose');

// Model's declaration
var Account = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String} // don't set required to true for password (passport requirement)
});
Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);