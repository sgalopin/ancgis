// Import
const fs = require('fs');
const turf = require('@turf/turf');

module.exports = function (inputFileName, outputFileName) {

  // Removes the extra fields
  const data = JSON.parse(fs.readFileSync(inputFileName));
  let cleaned_data = data.features.map(function(data) {
    return {
      "type": data.type,
      "geometry": {
        "type": data.geometry.type,
        "coordinates": data.geometry.coordinates
      }
    };
  });

  // Removes the duplicates
  let final_cleaned_data = [];
  let i = 0;
  cleaned_data.forEach(function(element) {
      const poly = turf.polygon(element.geometry.coordinates);
      const kinks = turf.kinks(poly);
      // Removes the duplicates and self-intersections polygones
      if(!final_cleaned_data.includes(element) && kinks.features.length == 0){
        const polies = turf.unkinkPolygon(poly);
        if(polies.features.length == 1
          && i !== 6287 // Bad geom on dep 45
          && i !== 7249 // Bad geom on dep 45
          ) {
          poly.properties.id = i;
          final_cleaned_data.push(JSON.stringify(poly));
        }
      }
      i++;
  });
  console.log("water cleaned areas: ", final_cleaned_data.length + '/' + cleaned_data.length)

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
