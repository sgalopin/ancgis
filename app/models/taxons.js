var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TaxonSchema = new Schema({
	"taxon": {type: String, required: true},
	"vernacularName": {type: String, required: true},
	"periods": {type: [String], required: true},
	"potential": {type: Number, required: true},
	"wikipediaUrl": {type: String, required: false}
});
var Taxon = mongoose.model('Taxon', TaxonSchema);
module.exports = Taxon;
