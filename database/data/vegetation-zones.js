/*global db*/
db.vegetationzones.drop();
db.vegetationzones.insert([{
  // To set the "_id" use the ObjectId() function (ex: "_id": ObjectId("5a13f5bfc8c6de2d09c604da"))
  "type": "Feature",
  "properties": {
    "type": "forets",
    "flore": [{
      "taxon": 1 ,
      "recovery": 75
    }]
  },
  "geometry": {
    "type": "Circle",
    "coordinates": [308562, 6121084],
    "radius": 5
  }
},{
  "type": "Feature",
  "properties": {
    "type": "cultures",
    "flore": [{
      "taxon": 21,
      "recovery": 100
    },{
      "taxon": 22,
      "recovery": 100
    }]
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[308538, 6121101], [308556, 6121100], [308553, 6121074], [308534, 6121074]]]
  }
}]);
