// Requirements
var mongoose = require("mongoose");

// Model's declaration
module.exports = mongoose.model("Hive", new mongoose.Schema({
  "type": {type: String, required: true, default: "Feature"},
  "properties": {
    "registrationNumber": {type: String},
    "type": {type: String},
    "framesCount": {type: Number},
    "account": {type: String}
  },
  "geometry": {
    "type": {type: String, required: true, default: "Polygon"},
    "coordinates": {type: [[[Number]]], required: true}
  }
},{
  toJSON: {
    virtuals: true, // return the virtual auto assigned id field (http://mongoosejs.com/docs/guide.html#id)
    versionKey: false, // remove the "__v" field
    transform(doc, ret) { delete ret._id;  } // remove the "_id" field
  }
}));
