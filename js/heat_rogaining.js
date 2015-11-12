
var INITIAL_LAT = 61.46;
var INITIAL_LON = 23.766667;

var mmlTaustaLayer = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    attribution: 'Sisältää Maanmittauslaitoksen taustakartta-aineistoa, <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501">lisenssi</a>, TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a>',
    maxZoom: 18
});
var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 19
});
var osmCycleLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Maps &copy; <a href="http://thunderforest.com/">Thunderforest</a>',
    maxZoom: 18
});
var mmlOrtoLayer = L.tileLayer('http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg', {
    attribution: 'Sisältää Maanmittauslaitoksen ortoilmakuva-aineistoa, <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501">lisenssi</a>, TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a>',
    maxZoom: 19,
    minZoom: 13
});

var baseMaps = {
    "Taustakartta, Maanmittauslaitos": mmlTaustaLayer,
    "OpenStreetMap": osmLayer,
    "Ilmakuva, MML / kartat.kapsi.fi": mmlOrtoLayer,
    "Pyöräily, Thunderforest": osmCycleLayer
}

var heatmapLayer = undefined;
var cfg = {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    "radius": 0.017,
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
    valueField: 'visits'
};

var heat_data = undefined;

$(document).ready(function(){

    var data3 = [];

    d3.csv('/data/yo_roga_2015_rastit_korjattu_muokattu.csv', function(data) {	
	//console.log(data);
	
	d3.csv('/data/yo_roga_2015_kaynnit.csv', function(data2) {
	    
	    //console.log(data2);
	    
	    for (var i = 0; i < data.length; i++) {
		data[i].lat = Number(data[i].lat);
		data[i].lng = Number(data[i].lng);
		for (var j = 0; j < data2.length; j++) {
		    if (data[i].name == data2[j].name) {
			data[i].visits = Number(data2[j].visits);
			data3.push(data[i]);
			break;
		    }
		}
	    }
		
	    heatmapLayer = new HeatmapOverlay(cfg);
	    console.log(heatmapLayer);

	    var map = L.map('map_canvas', {layers: [mmlTaustaLayer, heatmapLayer]}).setView([INITIAL_LAT, INITIAL_LON], 12);

	    L.control.layers(baseMaps).addTo(map);
	    map.on('baselayerchange', function(event) {
		if (event.layer == mmlOrtoLayer) {
		    if (map.getZoom() < 13) {
			map.setZoom(13);
		    }
		}
	    });

	    heat_data = { data: data3 };
	    heatmapLayer.setData(heat_data);

	    heat_slider = L.control.slider(function(value) {
		console.log(value);

		cfg.radius = value;
		map.removeLayer(heatmapLayer);
		heatmapLayer = new HeatmapOverlay(cfg);
		map.addLayer(heatmapLayer);
		heatmapLayer.setData(heat_data);
	    }, {
		orientation: 'vertical',
		size: '250px',
		id: 'heat_slider',
		value: 0.017,
		step: 0.001,
		max: 0.05,
		min: 0.001,
		increment: true,
		collapsed: false
	    }).addTo(map);
	    
	    //console.log(heat_slider);

	    //console.log(data3);

	    for (var i = 0; i < data3.length; i++) {
		L.marker([data3[i].lat, data3[i].lng], {title: data3[i].name}).bindPopup('<p>' + data3[i].name + '<br>' + data3[i].visits + ' käyntiä<p>').addTo(map);
	    }
	});
    });
});
