var express = require('express');
var router = express.Router();
var taxons = require('../models/taxons');
router.get('/', function(req, res) {
  res.render('taxons', {title: 'Taxons', taxons: taxons});
});
module.exports = router;
