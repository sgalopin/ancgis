// Import
const fs = require('fs');

module.exports = function (inputFileName, outputFileName) {

  // Removes the extra fields
  const data = JSON.parse(fs.readFileSync(inputFileName));
  let cleaned_data = data.features.map(function(antenne) {
    return JSON.stringify({
      "type": antenne.type,
      "geometry": {
        "type": antenne.geometry.type,
        "coordinates": antenne.geometry.coordinates
      }
    });
  });

  // Removes the duplicates
  let final_cleaned_data = [];
  cleaned_data.forEach(function(element) {
    if(!final_cleaned_data.includes(element)){
        final_cleaned_data.push(element);
    }
  });

  // Override the final_cleaned_data toString method.
  final_cleaned_data.toString = function() {
      return this.join(',\n');
  };

  // Setup and write the js file
  const jsContent =
`/*global db*/
db.waterareas.drop();
db.waterareas.insert([
${final_cleaned_data}
]);
db.waterareas.createIndex({ "geometry": "2dsphere" });`;

  fs.writeFileSync(outputFileName, jsContent, 'utf8');
}
