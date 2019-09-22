// Requirements
var mongoose = require("mongoose");

// Model's declaration
module.exports = mongoose.model("Taxon", new mongoose.Schema({
	"_id": {type: Number, required: true, alias: "id"},
	"isValid": {type: Boolean, required: true},
	"rank": {type: String, required: true},
	"family": {
		"latin": {type: String, unique: true, required: true},
		"fr": {type: String, unique: true, required: true}
	},
	"name": {
		"latin": {type: String, unique: true, required: true},
		"fr": {type: String, unique: true, required: true}
	},
	"periods": {
		"blooming": {type: [String], required: true},
		"honeydew": {type: [String], required: true}
	},
	"potentials": {
		"nectar": {type: mongoose.Schema.Types.Mixed, required: true},
		"pollen": {type: mongoose.Schema.Types.Mixed, required: true},
		"honeydew": {type: mongoose.Schema.Types.Mixed, required: true},
		"propolis": {type: mongoose.Schema.Types.Mixed, required: true}
	},
	"colors": {
		"hex": {
			"flower": {type: String},
			"pollen": {type: String},
			"liquidHoney": {type: String},
			"solidHoney": {type: String}
		},
		"fr": {
			"flower": {type: String},
			"pollen": {type: String},
			"liquidHoney": {type: String},
			"solidHoney": {type: String}
		}
	},
	"urls": {
		"fr": {
			"wikipedia": {type: String},
			"telabotanica": {type: String},
			"smartflore": {type: String},
			"inpn": {type: String}
		}
	},
	"ecology": {
		"lifeCycle": {type: [String], required: true},
		"stratification": {type: [String], required: true},
		"climate": {
			"brightness": {type: mongoose.Schema.Types.Mixed, required: true},
			"moisture": {type: mongoose.Schema.Types.Mixed, required: true},
			"temperature": {type: mongoose.Schema.Types.Mixed, required: true},
			"continentality": {type: mongoose.Schema.Types.Mixed, required: true}
		},
		"soil": {
			"acidity": {type: mongoose.Schema.Types.Mixed, required: true},
			"moisture": {type: mongoose.Schema.Types.Mixed, required: true},
			"texture": {type: mongoose.Schema.Types.Mixed, required: true},
			"nutrients": {type: mongoose.Schema.Types.Mixed, required: true},
			"salinity": {type: mongoose.Schema.Types.Mixed, required: true},
			"organicMaterial": {type: mongoose.Schema.Types.Mixed, required: true}
		}
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
