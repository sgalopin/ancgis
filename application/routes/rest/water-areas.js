var router = require("./rest-router");
var model = require("../../models/water-areas");
module.exports = router(model, "", true, false);
