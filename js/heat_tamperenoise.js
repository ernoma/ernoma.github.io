
var INITIAL_LAT = 61.5;
var INITIAL_LON = 23.766667;

var mmlTaustaLayer = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    attribution: 'Sisältää Maanmittauslaitoksen taustakartta-aineistoa, <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501">lisenssi</a>, TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a>',
    maxZoom: 18
});

$(document).ready(function(){
	
    $.getJSON('/data/tampere_noise_2012_day.json', function(data) {
	console.log('success');
	
	//console.log(JSON.parse(data));
	
	//console.log(data);
	
	// 45-50, 50-55, 55-60, 60-65, 65-70, 70-75, 75-80, 80-85

	var noiseLayer = L.geoJson(data, {
	    style: function(feature) {
		if (feature.properties.DB_LO == 45) {
		    return { color: "#ffffcc" };
		}
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#ffeda0" };
                }
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#fed976" };
                }
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#feb24c" };
                }
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#fd8d3c" };
                }
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#fc4e2a" };
                }
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#e31a1c" };
                }
		else if (feature.properties.DB_LO == 45) {
                    return { color: "#b10026" };
                }
		else {
		    console.log("Unknown DB_LO: " + feature.properties.DB_LO);
		}
	    }
	});
	
	var map = L.map('map_canvas', {layers: [mmlTaustaLayer, noiseLayer]}).setView([INITIAL_LAT, INITIAL_LON], 12);
		
	});
});
