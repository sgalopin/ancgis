var router = require("./rest-router");
var model = require("../../models/hvl-sectors");
module.exports = router(model, "", true, false);
