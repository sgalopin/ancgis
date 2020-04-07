/*global db*/
db.vegetationzones.drop();
db.vegetationzones.insert([{
  // To set the "_id" use the ObjectId() function (ex: "_id": ObjectId("5a13f5bfc8c6de2d09c604da"))
  "_id": "82965630-cca9-11e8-813f-e5ced482ba7d",
  "type": "Feature",
  "properties": {
    "type": "forets",
    "flore": [{
      "taxon": 116574,
      "recovery": 75
    }],
    "account": "5b939503845b75060d79c7da",
    "metadata": {
      "timestamp": 1475960555
    }
  },
  "geometry": {
    "type": "Circle",
    "coordinates": [2.7718596, 48.0854592],
    "radius": 0.000053327347588449925
  }
},{
  "_id": "8b130920-cca9-11e8-813f-e5ced482ba7d",
  "type": "Feature",
  "properties": {
    "type": "cultures",
    "flore": [{
      "taxon": 127454,
      "recovery": 100
    }],
    "account": "5b939503845b75060d79c7da",
    "metadata": {
      "timestamp": 1602176555
    }
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[2.771621212540061, 48.085559007568385], [2.771782909291203, 48.085553006641085], [2.771755959832679, 48.085396982285459], [2.771585279928696, 48.085396982285459]]]
  }
}]);
