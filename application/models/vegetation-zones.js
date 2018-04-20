// Requirements
var mongoose = require('mongoose');
var Taxon = require('./taxons');

// Model's declaration
module.exports = mongoose.model('VegetationZone', new mongoose.Schema({
  "type": {type: String, required: true},
  "properties": {
    "type": {type: String},
    "flore": [{
      "taxon": {type: Number, ref: 'Taxon'},
      "recovery": {type: Number}
    }]
  },
  "geometry": {
    "type": {type: String, required: true},
    "coordinates": {type: mongoose.Schema.Types.Mixed, required: true},
    "radius": {type: Number}
  }
}, {
  toJSON: {
    virtuals: true, // return the virtual auto assigned id (http://mongoosejs.com/docs/guide.html#id)
    versionKey: false, // remove the '__v' field
    transform: function (doc, ret) {
      delete ret._id;
      if (ret.properties.flore) {
          ret.properties.flore.forEach(function(element){
          delete element._id;
        });
      }
    } // remove the '_id' fields
  }
}));
