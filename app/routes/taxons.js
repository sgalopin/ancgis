var express = require('express');
var router = express.Router();
var Taxon = require('../models/taxons');
router.get('/', function(req, res) {
 Taxon.find(function(err, taxons) {
   if (err) return console.error(err);
   res.render('taxons', {title: 'Taxons', taxons: taxons});
 });
});
module.exports = router;
