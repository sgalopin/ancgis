
// Define a namespace for the application.
var anc = {
	interaction:{}
};

// Hives layer
var stroke = new ol.style.Stroke({color: 'black', width: 2});
var fill = new ol.style.Fill({color: 'red'});
var hivesLayerSource = new ol.source.Vector({wrapX: false});
var hivesLayer = new ol.layer.Vector({
	source: hivesLayerSource,
	style: new ol.style.Style({
		fill: fill,
		stroke: stroke,
		text: new ol.style.Text({
			text: 'N°...'
		})
	})
});

// Draw layer
var stroke = new ol.style.Stroke({color: 'black', width: 2});
var fill = new ol.style.Fill({color: 'green'});
var drawLayerSource = new ol.source.Vector({wrapX: false});
var drawLayer = new ol.layer.Vector({
	source: drawLayerSource,
	style: new ol.style.Style({
		fill: fill,
		stroke: stroke,
		text: new ol.style.Text({
			text: 'Plante...'
		})
	})
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

var bdortho = new ol.layer.Tile({
	source: ign_source
});

// Map
anc.map = new ol.Map({
	layers: [bdortho, hivesLayer, drawLayer],
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

// Add Hive Button Control
anc.interaction.addhive = new ol.interaction.AddHive({
	source: hivesLayerSource
});
// Draw Button Control
anc.interaction.draw = new ol.interaction.Draw({
	source: drawLayerSource,
	type: 'Polygon'
});

$('#anc-mapcontrol-tbar>button').click(function(){
	event.stopPropagation();
	$(this).toggleClass('active');
	if($(this).is('.active')){
		$('#anc-mapcontrol-tbar>button[id!="'+ $(this).attr('id') +'"]').trigger('controlChange');
		anc.map.addInteraction(anc.interaction[$(this)[0].dataset.shortid]);
	} else {
		anc.map.removeInteraction(anc.interaction[$(this)[0].dataset.shortid]);
	}
});
$('#anc-mapcontrol-tbar>button').on('controlChange', function(event) {
	event.stopPropagation();
	if($(this).is('.active')){
		$(this).toggleClass('active');
		anc.map.removeInteraction(anc.interaction[$(this)[0].dataset.shortid]);
	}
});