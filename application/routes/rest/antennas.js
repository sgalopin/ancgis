var router = require("./rest-router");
var model = require("../../models/antenna-sectors");
module.exports = router(model, "", true, false);
