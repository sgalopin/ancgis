require('../../ol/interaction/addhive');
require('../../ol/interaction/editzoneproperties');
require('../../ol/control/periodswitcher');

/**
 * Map builder.
 */
module.exports = (function() {

	// Hives layer
	var hivesLayerSource = new ol.source.Vector({
		wrapX: false,
		url: './rest/hives',
	    format: new ol.format.GeoJSON()
	});
	var hivesLayer = new ol.layer.Vector({
		name: 'hivesLayer',
		source: hivesLayerSource,
		style: function(feature) {
			var ppts = feature.getProperties();
			return new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'red'
				}),
				stroke: new ol.style.Stroke({
					color: 'black',
					width: 2
				}),
				text: new ol.style.Text({
					text: 'N°' + ppts.registrationNumber
				})
			});
		}
	});

	// Draw layer
	// Add the circle type to the GeoJSON (not supported yet)
	ol.format.GeoJSON.GEOMETRY_READERS_['Circle'] = function(object) {
	  return new ol.geom.Circle(object.coordinates, object.radius);
	};
	var vegetationsLayerSource = new ol.source.Vector({
		wrapX: false,
		url: './rest/vegetation-zones',
	    format: new ol.format.GeoJSON()
	});
	var vegetationsLayer = new ol.layer.Vector({
		name: 'vegetationsLayer',
		source: vegetationsLayerSource,
		style: function(feature) {
			var ppts = feature.getProperties();
			// Style text
			if(ppts.flore) {
				var text = '';
				ppts.flore.forEach(function(species, i) {
					if (i !== 0) {
						text += '\n\n';
					}
				  text += species.taxon.vernacularName + '\n'
					+ species.taxon.periods + '\n'
					+ species.recovery + '%';
				});
				text = new ol.style.Text({
					text: text
				});
			}
			// Style stroke and fill
			var styles = {
			    'Polygon': new ol.style.Style({
			      stroke: new ol.style.Stroke({
			        color: 'black',
			        width: 2
			      }),
			      fill: new ol.style.Fill({
			        color: 'rgba(255, 255, 0, 0.1)'
			      }),
				  text: text ? text : undefined
			    }),
			    'Circle': new ol.style.Style({
			      stroke: new ol.style.Stroke({
			        color: 'black',
			        //lineDash: [4],
			        width: 2
			      }),
			      fill: new ol.style.Fill({
			        color: 'rgba(0,255,0,0.1)'
			      }),
				  text: text ? text : undefined
			    })
			};
			return styles[feature.getGeometry().getType()];
		}
	});

	// BDORTHO layer
	var resolutions = [];
	var matrixIds = [];
	var proj3857 = ol.proj.get('EPSG:3857');
	var maxResolution = ol.extent.getWidth(proj3857.getExtent()) / 256;

	for (var i = 0; i < 18; i++) {
		matrixIds[i] = i.toString();
		resolutions[i] = maxResolution / Math.pow(2, i);
	}

	var tileGrid = new ol.tilegrid.WMTS({
		origin: [-20037508, 20037508],
		resolutions: resolutions,
		matrixIds: matrixIds
	});

	var key = '7wbodpc2qweqkultejkb47zv';

	var ign_source = new ol.source.WMTS({
		url: 'http://wxs.ign.fr/' + key + '/wmts',
		//layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
		layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
		matrixSet: 'PM',
		format: 'image/jpeg',
		projection: 'EPSG:3857',
		tileGrid: tileGrid,
		style: 'normal',
		attributions: [new ol.Attribution({
		  html: '<a href="http://www.geoportail.fr/" target="_blank">' +
			  '<img src="https://api.ign.fr/geoportail/api/js/latest/' +
			  'theme/geoportal/img/logo_gp.gif"></a>'
		})]
	});

	var bdorthoLayer = new ol.layer.Tile({
		name: 'bdorthoLayer',
		source: ign_source
	});

	ol.Map.prototype.getLayerByName = function(layerName) {
		return this.getLayers().getArray().find(function(layer) {
			return layer.get('name') === layerName;
		});
	};

	return new ol.Map ({ // Openlayers Map
			layers: [bdorthoLayer, hivesLayer, vegetationsLayer],
			target: 'anc-map',
			keyboardEventTarget: document,
			controls: [
				new ol.control.PeriodSwitcher(),
				new ol.control.Attribution(),
				new ol.control.ZoomSlider(),
				new ol.control.ScaleLine(),
				new ol.control.MousePosition({
					className:'',
					target:document.getElementById('anc-mapstatus-mouseposition'),
					coordinateFormat :function(coords){
						var template = 'X: {x} - Y: {y} ';
						return ol.coordinate.format(coords, template);
				}})
			],
			view: new ol.View({
			  zoom: 20,
			  //center: ol.proj.transform([5, 45], 'EPSG:4326', 'EPSG:3857')
			  center: [308555, 6121070] // Chez Didier
			})
		});
})();
