// Import
const fs = require('fs');

module.exports = function (inputFileName, outputFileName) {

  // Removes the extra fields
  const data = JSON.parse(fs.readFileSync(inputFileName));
  let cleaned_data = data.features.map(function(data) {
    return JSON.stringify({
      "type": data.type,
      "properties": {
        "Azimut": data.properties.Azimut
      },
      "geometry": {
        "type": data.geometry.type,
        "coordinates": data.geometry.coordinates
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

  // Setup and write the geojson file
  const geojsonContent =
`{
"type": "FeatureCollection",
"name": "${data.name}",
"crs": { "type": "name", "properties": { "name": "${data.crs.properties.name}" } },
"features": [
${final_cleaned_data}
]}`;

  fs.writeFileSync(outputFileName, geojsonContent, 'utf8');
}
