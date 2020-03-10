// Requirements
var mongoose = require("mongoose");

// Model's declaration
module.exports = mongoose.model("PedoclimaticZones", new mongoose.Schema({
	"type": {type: String, required: true},
	"properties": {
		"acidity": {type: [Float, Float], required: true},
		"moisture": {type: [Float, Float], required: true},
		"texture": {type: [Float, Float], required: true},
		"salinity": {type: [Float, Float], required: true},
		"organicmat": {type: [Float, Float], required: true},
		"nutrients": {type:[Float, Float], required: true},
		"brightness": {type: Number, required: true},
		"moisture_atmo": {type: Number, required: true},
		"temperature": {type: Number, required: true},
		"continentalite": {type: Number, required: true},
		"id": {type: Number, required: true, required: true}
	},
  "geometry": {
    "type": {type: String, required: true, default: "Polygon"},
    "coordinates": {type:[[[Number]]], required: true},
  }
},{
  toJSON: {
    virtuals: true, // return the virtual auto assigned id (http://mongoosejs.com/docs/guide.html#id)
    versionKey: false, // remove the "__v" field
    transform(doc, ret) {
			delete ret._id;
			ret.id = Number(ret.id);
		} // remove the "_id" field
  }
}));
