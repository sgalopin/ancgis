// Requirements
var mongoose = require("mongoose");

// Model's declaration
module.exports = mongoose.model("Taxon", new mongoose.Schema({
	"_id": {type: Number, required: true},
	"name": {type: String, unique: true, required: true},
	"vernacularName": {type: String, required: true},
	"periods": {type: [String], required: true},
	"potential": {type: Number, required: true},
	"wikipediaUrl": {type: String, required: false}
},{
  toJSON: {
    virtuals: true, // return the virtual auto assigned id (http://mongoosejs.com/docs/guide.html#id)
    versionKey: false, // remove the "__v" field
    transform: function (doc, ret) {
			delete ret._id;
			ret.id = Number(ret.id);
		} // remove the "_id" field
  }
}));
