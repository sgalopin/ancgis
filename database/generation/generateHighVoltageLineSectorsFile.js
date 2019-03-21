// Imports
const fs = require('fs');
const turf = require('@turf/turf');

module.exports = function (inputFileName, outputJsFileName) {

  // Gets the hvl
  const hvl = JSON.parse(fs.readFileSync(inputFileName));

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
    poly.properties.id = featureIndex
    poly.properties.fac = fac
    poly.line = currentGeometry;

    sector.push(poly);
  });

  // Removes the duplicates
  let final_cleaned_data = [];
  sector.forEach(function(element) {
    sEl = JSON.stringify(element)
    sElGeom = JSON.stringify(element.geometry.coordinates)
    // Removes bad data
    if (!sElGeom.includes("-1.") && !sElGeom.includes("0.")) {
        final_cleaned_data.push(sEl);
    }
  });
  console.log("hvl cleaned sectors: ", final_cleaned_data.length + '/' + sector.length)

  // Override the sector toString method.
  final_cleaned_data.toString = function() {
      return this.join(',\n');
  };

  // Setup and write the hvl sectors file
  const content =
`/*global db*/
db.hvlsectors.drop();
db.hvlsectors.insert([
${final_cleaned_data}
]);
db.hvlsectors.createIndex({ "geometry": "2dsphere" });`;

  fs.writeFileSync(outputJsFileName, content, 'utf8');
}
