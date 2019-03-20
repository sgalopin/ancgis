// Imports
const fs = require('fs');
const turf = require('@turf/turf');

module.exports = function (inputFileName, outputJsFileName) {

  // Gets the hvl
  const hvl = JSON.parse(fs.readFileSync(inputFileName));

  // hvl parameters
  const rayon_zone_emission_antenne= 0.5;
  const angle_cone_emission = 120;

  // Creates the hvl sectors
  let sector=[];
  turf.geomEach(hvl, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
    voltage=featureProperties["TENSIONMAX"].replace("kv","")
    voltage=parseFloat(voltage.replace("<",""))
    fac=(voltage/10)**2
    dist=10
    while (fac/dist**2>0.001){
      dist= dist + 10
    }

    offsetLine1 = turf.lineOffset(currentGeometry, dist, {units:'meters'});
    offsetLine2 = turf.lineOffset(currentGeometry, -dist, {units:'meters'});
    coord=offsetLine1.geometry.coordinates
    for (var iter =offsetLine2.geometry.coordinates.length-1; iter>=0; iter--) {
      coord.push(offsetLine2.geometry.coordinates[iter])
    }
    coord.push(coord[0])
    poly=turf.polygon([coord])
    poly=turf.unkinkPolygon(poly)
    poly=turf.union.apply(this,poly.features)
    //poly.properties.id=featureIndex
    poly.properties.fac=fac

    sector.push(JSON.stringify(poly));
  });

  // Override the sector toString method.
  sector.toString = function() {
      return this.join(',\n');
  };

  // Setup and write the hvl sectors file
  const content =
`/*global db*/
db.hvlsectors.drop();
db.hvlsectors.insert([
${sector}
]);
db.hvlsectors.createIndex({ "geometry": "2dsphere" });`;

  fs.writeFileSync(outputJsFileName, content, 'utf8');
}
