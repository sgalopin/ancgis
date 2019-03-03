var router = require("./rest-router");
var model = require("../../models/apiaries");
module.exports = router(model, "", true, true);
