// sudo npm install -g ajv
const fs = require('fs');
var Ajv = require('ajv');

// Files parameters
var cfg = JSON.parse(fs.readFileSync("../config.json"));

let schema = JSON.parse(fs.readFileSync('pedoclimaticzones.schema.json'));
let data = JSON.parse(fs.readFileSync('../' + cfg.pedoclimaticzonesInputFileName));
console.log(data.length + " pedoclimaticzones into file...");

var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
let pedoclimaticzonesToCheck = 0;
for (var datum of data) {
  if (datum.isValid) pedoclimaticzonesToCheck++
}
let checkedPedoclimaticzones = 0;
for (var datum of data) {
  if (datum.isValid) {
    var valid = validate(datum);
    if (!valid) {
      console.log(datum.id);
      console.log(validate.errors);
      //break;
    }
    checkedPedoclimaticzones++
  }
}
console.log(checkedPedoclimaticzones + "/" + pedoclimaticzonesToCheck + " pedoclimaticzones checked...");
