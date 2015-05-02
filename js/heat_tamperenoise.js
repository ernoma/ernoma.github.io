
var INITIAL_LAT = 61.5;
var INITIAL_LON = 23.766667;

var mmlTaustaLayer = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    attribution: 'Sisältää Maanmittauslaitoksen taustakartta-aineistoa, <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501">lisenssi</a>, TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a>',
    maxZoom: 18
});

$(document).ready(function(){
	
    var noiseLayer = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
	layers: 'opendata:YV_MELU_Y_2012_KESKIAANI',
	format: 'image/png'
    });
    
    var map = L.map('map_canvas', {layers: [mmlTaustaLayer, noiseLayer]}).setView([INITIAL_LAT, INITIAL_LON], 12);
		
});
