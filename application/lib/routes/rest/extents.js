var router = require("./rest-router");
var model = require("../../models/extents");
module.exports = router(model, "", true, true);
