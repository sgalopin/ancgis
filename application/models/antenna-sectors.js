// Requirements
var mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");

// Model's declaration
let schema = new mongoose.Schema({
  "_id": { type: String, default: uuidv1(), alias: "id" },
  "type": {type: String, required: true, default: "Feature"},
  "properties": {
    "id": {type: Number}
  },
  "position": {
    "type": {type: String, required: true, default: "Point"},
    "coordinates": {type: [Number], required: true}
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
});
schema.index({ 'geometry': '2dsphere' });
module.exports = mongoose.model("AntennaSector", schema);
