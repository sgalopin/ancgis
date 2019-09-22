// sudo npm install -g ajv
const fs = require('fs');
var Ajv = require('ajv');

// Files parameters
var cfg = JSON.parse(fs.readFileSync("../config.json"));

let schema = JSON.parse(fs.readFileSync('taxon.schema.json'));
let data = JSON.parse(fs.readFileSync('../' + cfg.taxonsInputFileName));
console.log(data.length + " taxons into file...");

var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
let taxonsToCheck = 0;
for (var datum of data) {
  if (datum.isValid) taxonsToCheck++
}
let checkedTaxons = 0;
for (var datum of data) {
  if (datum.isValid) {
    var valid = validate(datum);
    if (!valid) {
      console.log(datum._id);
      console.log(validate.errors);
      //break;
    }
    checkedTaxons++
  }
}
console.log(checkedTaxons + "/" + taxonsToCheck + " taxons checked...");
