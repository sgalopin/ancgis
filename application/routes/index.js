var express = require('express');
var router = express.Router(); // eslint-disable-line new-cap

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
