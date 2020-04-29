/**
 * AncGIS - Web GIS for the analysis of honey resources around an apiary
 * Copyright (C) 2020  Sylvain Galopin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
 
var mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");

// Model's declaration
module.exports = mongoose.model("Hive", new mongoose.Schema({
  "_id": { type: String, default: uuidv1(), alias: "id" },
  "type": {type: String, required: true, default: "Feature"},
  "properties": {
    "registrationNumber": {type: String},
    "type": {type: String},
    "framesCount": {type: Number},
    "account": {type: String},
    "metadata": {
      "timestamp": {type: Number}
    }
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
