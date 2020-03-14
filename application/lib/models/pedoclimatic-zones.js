// Requirements
var mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");

// Model's declaration
module.exports = mongoose.model("PedoclimaticZone", new mongoose.Schema({
	"_id": {type: String, default: uuidv1(), alias: "id"},
	"type": {type: String, required: true},
	"properties": {
		"acidity": {type: [Number], required: true},
		"moisture": {type: [Number], required: true},
		"texture": {type: [Number], required: true},
		"salinity": {type: [Number], required: true},
		"organicmat": {type: [Number], required: true},
		"nutrients": {type: [Number], required: true},
		"brightness": {type: Number, required: true},
		"moisture_atmo": {type: Number, required: true},
		"temperature": {type: Number, required: true},
		"continentality": {type: Number, required: true}
	},
  "geometry": {
    "type": {type: String, required: true, default: "Polygon"},
    "coordinates": {type: mongoose.Schema.Types.Mixed, required: true}
  }
},{
  toJSON: {
    virtuals: true, // return the virtual auto assigned id (http://mongoosejs.com/docs/guide.html#id)
    versionKey: false, // remove the "__v" field
		transform(doc, ret) { delete ret._id;  } // remove the "_id" field
  }
}));
