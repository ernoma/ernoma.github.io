
var INITIAL_LAT = 61.5;
var INITIAL_LON = 23.766667;

var mmlTaustaLayer = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    attribution: 'Sisältää Maanmittauslaitoksen taustakartta-aineistoa, <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501">lisenssi</a>, TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a>',
    maxZoom: 18
});

$(document).ready(function(){
	
	$.getJSON('/data/tampere_lights.json', function(data) {
		console.log('success');
		
		//console.log(JSON.parse(data));
		
		//console.log(data);
		
		var cfg = {
			// radius should be small ONLY if scaleRadius is true (or small radius is intended)
			// if scaleRadius is false it will be the constant radius used in pixels
			"radius": 0.0005,
			"maxOpacity": .8, 
			// scales the radius based on map zoom
			"scaleRadius": true, 
			// if set to false the heatmap uses the global maximum for colorization
			// if activated: uses the data maximum within the current map boundaries 
			//   (there will always be a red spot with useLocalExtremas true)
			"useLocalExtrema": true,
			// which field name in your data represents the latitude - default "lat"
			latField: 'lat',
			// which field name in your data represents the longitude - default "lng"
			lngField: 'lng',
			// which field name in your data represents the data value - default "value"
			valueField: 'count'
		};
		
		var heatmapLayer = new HeatmapOverlay(cfg);
		
		var map = L.map('map_canvas', {layers: [mmlTaustaLayer, heatmapLayer]}).setView([INITIAL_LAT, INITIAL_LON], 12);
		
		heatmapLayer.setData(data);
		
	});
});