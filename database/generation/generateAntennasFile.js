// Import
const fs = require('fs');

module.exports = function (inputFileName, outputGeojsonFileName, outputJsFileName) {

  // Removes the extra fields
  const antennes = JSON.parse(fs.readFileSync(inputFileName));
  let cleaned_antennes = antennes.features.map(function(antenne) {
    return JSON.stringify({
      "type": antenne.type,
      "properties": {
        "Azimut": antenne.properties.Azimut
      },
      "geometry": {
        "type": antenne.geometry.type,
        "coordinates": antenne.geometry.coordinates
      }
    });
  });

  // Removes the duplicates
  let final_cleaned_antennes = [];
  cleaned_antennes.forEach(function(element) {
    if(!final_cleaned_antennes.includes(element)){
        final_cleaned_antennes.push(element);
    }
  });

  // Override the final_cleaned_antennes toString method.
  final_cleaned_antennes.toString = function() {
      return this.join(',\n');
  };

  // Setup and write the geojson file
  const geojsonContent =
`{
"type": "FeatureCollection",
"name": "${antennes.name}",
"crs": { "type": "name", "properties": { "name": "${antennes.crs.properties.name}" } },
"features": [
${final_cleaned_antennes}
]}`;

  fs.writeFileSync(outputGeojsonFileName, geojsonContent, 'utf8');

  // Setup and write the js file
  const jsContent =
`/*global db*/
db.antennas.drop();
db.antennas.insert([
${final_cleaned_antennes}
]);
db.antennas.createIndex({ "geometry": "2dsphere" });`;

  fs.writeFileSync(outputJsFileName, jsContent, 'utf8');
}
