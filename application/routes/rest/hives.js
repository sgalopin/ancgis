var router = require('./rest-router');
var model = require('../../models/hives');
module.exports = router(model, '', true);
