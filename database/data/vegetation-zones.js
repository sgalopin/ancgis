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
    "coordinates": [308562, 6121084],
    "radius": 5
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
    "coordinates": [[[308538, 6121101], [308556, 6121100], [308553, 6121074], [308534, 6121074]]]
  }
}]);
