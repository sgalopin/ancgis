// Requirements
var mongoose = require("mongoose");
const uuidv1 = require('uuid/v1');

// Model's declaration
module.exports = mongoose.model("Extent", new mongoose.Schema({
  "_id": { type: String, default: uuidv1(), alias: 'id' },
  "type": {type: String, required: true},
  "properties": {
    "account": {type: String},
    "metadata": {
      "timestamp": {type: Number}
    }
  },
  "geometry": {
    "type": {type: String, required: true},
    "coordinates": {type: mongoose.Schema.Types.Mixed, required: true}
  }
}, {
  toJSON: {
    virtuals: true, // return the virtual auto assigned id (http://mongoosejs.com/docs/guide.html#id)
    versionKey: false, // remove the "__v" field
    transform(doc, ret) { delete ret._id;  } // remove the "_id" field
  }
}));
