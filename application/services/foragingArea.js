// Imports
const turf = require('@turf/turf');
const fs = require('fs');
const cfg = require("./foragingAreaConfig.js");
const AntennaSector = require("../models/antenna-sectors.js");

module.exports = async function (coordinates) {
  try{
    // Création de la zone d'étude
    var ruche = turf.point(coordinates);
    ruche = turf.toWgs84(ruche);
    point_hg = turf.rhumbDestination(ruche, Math.sqrt(2*Math.pow(cfg.lookupAreaRadius,2)), 315);
    point_bd= turf.rhumbDestination(ruche, Math.sqrt(2*Math.pow(cfg.lookupAreaRadius,2)), 135);
    pt=turf.featureCollection([point_hg,point_bd]);
    var bbox = turf.bbox(pt);
    var poly_bbox = turf.bboxPolygon(bbox);

    // Génération Grille
    var hexgrid = turf.hexGrid(bbox, cfg.lookupAreaCellSize);
    var centroid_hexgrid=[];
    var distance_inter_centroid= (cfg.lookupAreaCellSize*Math.sqrt(3));
    var aire_cellule=turf.area(hexgrid.features[0].geometry)
    var id_centre_grille;

    // Calcul des centroid de la grille
    turf.geomEach(hexgrid, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
      const centroid = turf.centroid(currentGeometry,{"id":featureIndex});
      centroid_hexgrid.push(centroid);
      // Note: The properties object must be replaced, otherwise it is the same object that is shared over all the features.
      hexgrid.features[featureIndex].properties = {
        cout: 0,
        id: featureIndex,
        centroid: centroid
      };
      if (turf.inside(ruche, currentGeometry)) {
        ruche = turf.centroid(currentGeometry);
        id_centre_grille = featureIndex;
      }
    });
    centroid_hexgrid = turf.featureCollection(centroid_hexgrid);

    // Pondération de la grille par antenne
    for (var hexgridCell of hexgrid.features) {
      const intersectedSectors = await AntennaSector.find({
          "geometry": {
              "$geoIntersects": {
                  "$geometry": {
                     type: "Polygon" ,
                     coordinates: hexgridCell.geometry.coordinates,
                     crs: {
                        type: "name",
                        properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
                     }
                  }
              }
          }
      });
      if ( intersectedSectors.length > 0 ) {
        intersectedSectors.forEach(function(intersectedSector){
          const intersectionGeom = turf.intersect(intersectedSector.geometry, hexgridCell.geometry);
          if (intersectionGeom != null) {
            const ratio = turf.area(intersectionGeom) / aire_cellule;
            const dist = turf.distance(intersectedSector.position.coordinates, hexgridCell.properties.centroid);
            const cout = ratio * cfg.antennaWeightFactor / dist**2;
            hexgridCell.properties.cout = hexgridCell.properties.cout + cout;
          }
        });
      }
    };

    // Calcul des plus courts chemin de la ruche à l'ensemble des autres cases
    // Calcul du graph unidirectionnel ayant pour sommet les cellules du polygone et pour arc les voisinages immédiats
    var layout={} ;
    // on détermine ici qu'elle cellule sont les voisines de chaques cellules. Cette étape est couteuse en temps mais nécéssaire avec une grille hexagonale (on ne peut facilement connaitre l'id des cellules voisines contrairement à une grille carée)
    turf.geomEach(centroid_hexgrid, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
      temp=[]
      for (var iter = 0; iter <=120;iter=iter+60){
        temp.push(turf.rhumbDestination(currentGeometry, distance_inter_centroid, iter));
      }
      temp2={}
      turf.geomEach(hexgrid, function (currentGeometry2, featureIndex2, featureProperties, featureBBox, featureId) {
        for (var iter = 0; iter < 3;iter++){
          if (turf.inside(temp[iter],currentGeometry2)){
            // le cout de chaque arc est calculé en considérant un cout minimal égal à la distance entre deux cellules auquel on ajoute cette distance pondéré de la moyenne ds côut constaté entre les 2 cellules
            temp2[featureIndex2]=distance_inter_centroid*1000+distance_inter_centroid*1000*(hexgrid.features[featureIndex].properties.cout+hexgrid.features[featureIndex2].properties.cout  )/2
          }
        };
      });
      layout[featureIndex]=temp2
    });

    // Conversion du graph unidirectionnel en bidirectionnel
    var graph = {};
    for(var id in layout) {
      if(!graph[id])
        graph[id] = {};
      for(var aid in layout[id]) {
        graph[id][aid] = layout[id][aid];
        if(!graph[aid])
          graph[aid] = {};
        graph[aid][id] = layout[id][aid];
      }
    }

    // djikstra sur le graph
    function solve(graph, s) {
      var solutions = {};
      solutions[s] = [];
      solutions[s].dist = 0;
      while(true) {
        var parent = null;
        var nearest = null;
        var dist = Infinity;
        //for each existing solution
        for(var n in solutions) {
          if(!solutions[n])
            continue
          var ndist = solutions[n].dist;
          var adj = graph[n];
          //for each of its adjacent nodes...
          for(var a in adj) {
            //without a solution already...
            if(solutions[a])
              continue;
            //choose nearest node with lowest *total* cost
            var d = adj[a] + ndist;
            if(d < dist) {
              //reference parent
              parent = solutions[n];
              nearest = a;
              dist = d;
            }
          }
        }
        //no more solutions
        if(dist === Infinity) {
            break;
        }
        //extend parent's solution path
        solutions[nearest] = parent.concat(nearest);
        //extend parent's cost
        solutions[nearest].dist = dist;
      }
      return solutions;
    }

    //choose start node
    var start = id_centre_grille;
    //get all solutions
    var solutions = solve(graph, start);

    /*
    console.log("solutions.length",Object.keys(solutions).length);
    console.log("From '"+start+"' to");
    for(var s in solutions) {
      if(!solutions[s]) continue;
      console.log(" -> " + s + ": [" + solutions[s].join(", ") + "]   (dist:" + solutions[s].dist + ")");
    }
    */

    // on ajoute à la grille une propriétée res contenant la valeurs du plus court chemin constaté entre la ruche et la case considérée
    turf.geomEach(hexgrid, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
      hexgrid.features[featureIndex].properties.res = solutions[featureIndex].dist
    });

    // On ne retient que les x polygones les plus facilement atteignable
    hexgrid.features.sort((a, b) => parseFloat(a.properties.res) - parseFloat(b.properties.res)); //tri des polygones par éloignement
    var polygone_zone_butinage = []
    for (var hexgridCell of hexgrid.features) {
      if(hexgridCell.properties.res < cfg.maxWeight){
        polygone_zone_butinage.push(turf.buffer(hexgridCell,0.001));
      }
    }
    // TODO: If the polygone_zone_butinage aera < cfg.targetArea increase the cfg.maxWeight and add the next grid cells
    polygone_zone_butinage = turf.union.apply(this,polygone_zone_butinage);

    var c_polygone_zone_butinage = turf.toMercator(polygone_zone_butinage);
    return c_polygone_zone_butinage.geometry;

  } catch(e) {
    console.log(e);
  }
}
