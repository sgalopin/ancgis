// Imports
const fs = require('fs');
const turf = require('@turf/turf');

module.exports = function (inputFileName, outputJsFileName) {

  // Gets the antennas
  const antennas = JSON.parse(fs.readFileSync(inputFileName));

  // Antennas parameters
  const rayon_zone_emission_antenne= 0.5;
  const angle_cone_emission = 120;

  // Creates the antenna sectors
  let sector=[];
  turf.geomEach(antennas, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
    azimut = featureProperties["Azimut"];
    if (azimut !== null) { // "Directif"
      bearing1 = Math.round( parseFloat(azimut) - angle_cone_emission/2 );
      mysector = turf.sector(currentGeometry, rayon_zone_emission_antenne, bearing1, bearing1 + 120);
    } else { // "Non Directif" or null
      mysector = turf.sector(currentGeometry, rayon_zone_emission_antenne, 0, 360);
    }
    mysector.properties.id = featureIndex;
    mysector.position = currentGeometry;
    sector.push(JSON.stringify(mysector));
  });

  // Override the sector toString method.
  sector.toString = function() {
      return this.join(',\n');
  };

  // Setup and write the antenna sectors file
  const content =
`/*global db*/
db.antennasectors.drop();
db.antennasectors.insert([
${sector}
]);
db.antennasectors.createIndex({ "geometry": "2dsphere" });`;

  fs.writeFileSync(outputJsFileName, content, 'utf8');
}
