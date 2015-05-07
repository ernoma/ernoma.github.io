
var INITIAL_LAT = 61.5;
var INITIAL_LON = 23.766667;

var baseLayersOfMaps = [[], [], [], []];
var currentBaseLayerIndex = 0;

var markerNight2012 = undefined;
var markerDay2030 = undefined;
var markerNight2030 = undefined;

//$.getJSON('http://opendata.navici.com/tampere/opendata/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=opendata:YV_MELU_P_2012_KESKIAANI&outputFormat=json&srsName=EPSG:4326', function(data) {
//    console.log('success');
//    console.log(data);
//});


for (var i = 0; i < baseLayersOfMaps.length; i++) {
    var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	maxZoom: 17
    });
    baseLayersOfMaps[i].push(osmLayer);
    var osmCycleLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Maps &copy; <a href="http://thunderforest.com/">Thunderforest</a>',
	maxZoom: 17
    });
    baseLayersOfMaps[i].push(osmCycleLayer);
    var mapQuestLayer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
	subdomains: '1234',
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
	maxZoom: 17
    });
    baseLayersOfMaps[i].push(mapQuestLayer);
    var stamenTonerLayer = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.jpg', {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>. Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>',
	maxZoom: 17
    });
    baseLayersOfMaps[i].push(stamenTonerLayer);
    var mmlOrtoLayer = L.tileLayer('http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg', {
	attribution: 'Sisältää Maanmittauslaitoksen ortoilmakuva-aineistoa, <a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501">lisenssi</a>, TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a>',
	maxZoom: 17
    });
    baseLayersOfMaps[i].push(mmlOrtoLayer);
    var treGuideLayer = L.tileLayer.wms('http://opendata.navici.com/tampere/ows?service=wms', {
	attribution: 'Sisältää Tampereen kaupungin <a href="http://palvelut2.tampere.fi/tietovaranto/tietovaranto.php?id=136&alasivu=1&vapaasana=">"Tampereen opaskartta"</a>-aineistoa, <a href="http://www.tampere.fi/avoindata/lisenssi">lisenssi</a>',
	maxZoom: 17,
	layers: 'opendata:tampere_okartta_gk24',
	version: '1.3.0'
    });
    baseLayersOfMaps[i].push(treGuideLayer);
    var treBaseLayer = L.tileLayer.wms('http://opendata.navici.com/tampere/ows?service=wms', {
	attribution: 'Sisältää Tampereen kaupungin <a href="http://palvelut2.tampere.fi/tietovaranto/tietovaranto.php?id=137&alasivu=1&vapaasana=">"Tampereen kantakartta ilman kiinteistörajoja"</a>-aineistoa, <a href="http://www.tampere.fi/avoindata/lisenssi">lisenssi</a>',
	maxZoom: 17,
	layers: 'opendata:tampere_kkartta_pohja_gk24',
	version: '1.3.0'
    });
    baseLayersOfMaps[i].push(treBaseLayer);
}

var baseMaps = {
    "Perinteinen, OpenStreetMap": baseLayersOfMaps[1][0],
    "Opaskartta, Tampere": baseLayersOfMaps[1][5],
    "Kantakartta, Tampere": baseLayersOfMaps[1][6],
    "Ilmakuva, MML / kartat.kapsi.fi": baseLayersOfMaps[1][4],
    "Katu, MapQuest": baseLayersOfMaps[1][2],
    "Pyöräily, Thunderforest": baseLayersOfMaps[1][1],
    "Mustavalko, Stamen": baseLayersOfMaps[1][3]
}

$(document).ready(function(){

    var tilesURL = 'data/tre_noise_2012_day/{z}/{x}/{y}.png';
    var noiseLayerDay2012 = L.tileLayer(tilesURL, {
        minZoom: 10,
        maxZoom: 17
    });
    tilesURL = 'data/tre_noise_2012_night/{z}/{x}/{y}.png';
    var noiseLayerNight2012 = L.tileLayer(tilesURL, { 
	minZoom: 10,
	maxZoom: 17
    });
    tilesURL = 'data/tre_noise_2030_day/{z}/{x}/{y}.png';
    var noiseLayerDay2030 = L.tileLayer(tilesURL, {
        minZoom: 10,
        maxZoom: 17
    });
    tilesURL = 'data/tre_noise_2030_night/{z}/{x}/{y}.png';
    var noiseLayerNight2030 = L.tileLayer(tilesURL, {
        minZoom: 10,
        maxZoom: 17,
	attribution: 'Meluselvitys, Tampereen kaupunki, <a href="http://www.tampere.fi/avoindata/lisenssi">lisenssi</a>'
    });

	
/*    var noiseLayerNight2012 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
	layers: 'opendata:YV_MELU_Y_2012_KESKIAANI',
	format: 'image/png',
	transparent: true
    });
    var noiseLayerDay2012 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
        layers: 'opendata:YV_MELU_P_2012_KESKIAANI',
        format: 'image/png',
        transparent: true
    });

    var noiseLayerNight2030 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
        layers: 'opendata:YV_MELU_Y_2030_KESKIAANI',
        format: 'image/png',
        transparent: true,
        attribution: '<br>Sisältää Maanmittauslaitoksen taustakartta-aineistoa, \
<a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501", \
TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a> |<br>\
Meluselvitys, Tampereen kaupunki, <a href="http://www.tampere.fi/avoindata/lisenssi">lisenssi</a>'
    });
    var noiseLayerDay2030 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
        layers: 'opendata:YV_MELU_P_2030_KESKIAANI',
        format: 'image/png',
        transparent: true
    });
    */
    var mapDay2012 = L.map('div1', {
	layers: [baseLayersOfMaps[0][0], noiseLayerDay2012],
	attributionControl: false,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);
    var mapNight2012 = L.map('div2', {
	layers: [baseLayersOfMaps[1][0], noiseLayerNight2012],
        attributionControl: false,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);
    var mapDay2030 = L.map('div3', {
	layers: [baseLayersOfMaps[2][0], noiseLayerDay2030],
        attributionControl: false,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);
    var mapNight2030 = L.map('div4', {
	layers: [baseLayersOfMaps[3][0], noiseLayerNight2030],
        attributionControl: true,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);

    function baseMapChage(e) {
	for (var i = 0; i < baseLayersOfMaps[1].length; i++) {
	    if (baseLayersOfMaps[1][i] == e.layer) {
		mapDay2012.removeLayer(baseLayersOfMaps[0][currentBaseLayerIndex]);
		mapDay2030.removeLayer(baseLayersOfMaps[2][currentBaseLayerIndex]);
		mapNight2030.removeLayer(baseLayersOfMaps[3][currentBaseLayerIndex]);
		mapDay2012.addLayer(baseLayersOfMaps[0][i]);
		mapDay2030.addLayer(baseLayersOfMaps[2][i]);
		mapNight2030.addLayer(baseLayersOfMaps[3][i]);
		currentBaseLayerIndex = i;
		break;
	    }
	}
	noiseLayerDay2012.bringToFront();
	noiseLayerNight2012.bringToFront();
	noiseLayerDay2030.bringToFront();
	noiseLayerNight2030.bringToFront();
    };

    mapNight2012.on('baselayerchange', baseMapChage);

    L.control.layers(baseMaps).addTo(mapNight2012);
    noiseLayerNight2012.bringToFront();
    
    mapNight2012.addControl(L.control.zoom( { position: 'topright' } ));
    
    L.Control.setOpacityControlMap(mapNight2012);
    var higherOpacity = new L.Control.higherOpacity();
    mapNight2012.addControl(higherOpacity);
    //var opacitySlider = new L.Control.opacitySlider();
    //mapNight2012.addControl(opacitySlider);
    var lowerOpacity = new L.Control.lowerOpacity();
    mapNight2012.addControl(lowerOpacity);
    //higherOpacity.setOpacityLayer(noiseLayerNight2012);
    higherOpacity.addOpacityLayer(noiseLayerDay2012);
    higherOpacity.addOpacityLayer(noiseLayerNight2012);
    higherOpacity.addOpacityLayer(noiseLayerDay2030);
    higherOpacity.addOpacityLayer(noiseLayerNight2030);

    mapDay2012.sync(mapNight2012);
    mapDay2012.sync(mapDay2030);
    mapDay2012.sync(mapNight2030);

    mapNight2012.sync(mapDay2012);
    mapNight2012.sync(mapDay2030);
    mapNight2012.sync(mapNight2030);

    mapDay2030.sync(mapDay2012);
    mapDay2030.sync(mapNight2012);
    mapDay2030.sync(mapNight2030);
    
    mapNight2030.sync(mapDay2012);
    mapNight2030.sync(mapNight2012);
    mapNight2030.sync(mapDay2030);

    var infoNight2012 = L.control( { position: 'topleft' } );
    infoNight2012.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
	this.update();
	return this._div;
    }
    infoNight2012.update = function (text) {
	this._div.innerHTML = (text ? text : '');
    };
    var infoDay2012 = L.control( { position: 'topleft' } );
    infoDay2012.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
        this.update();
        return this._div;
    }
    infoDay2012.update = function (text) {
        this._div.innerHTML = (text ? text : '');
    };
    var infoDay2030 = L.control( { position: 'topleft' } );
    infoDay2030.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
        this.update();
        return this._div;
    }
    infoDay2030.update = function (text) {
        this._div.innerHTML = (text ? text : '');
    };
    var infoNight2030 = L.control( { position: 'topleft' } );
    infoNight2030.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
        this.update();
        return this._div;
    }
    infoNight2030.update = function (text) {
        this._div.innerHTML = (text ? text : '');
    };

    infoNight2012.addTo(mapNight2012);
    infoNight2012.update('Melu 2012 yöllä');
    infoDay2012.addTo(mapDay2012);
    infoDay2012.update('Melu 2012 päivällä');
    infoDay2030.addTo(mapDay2030);
    infoDay2030.update('Melu 2030 päivällä, ennuste');
    infoNight2030.addTo(mapNight2030);
    infoNight2030.update('Melu 2030 yöllä, ennuste');

    var searchControl = undefined;
    
    mapDay2012.addControl( searchControl = new L.Control.Search({
	callData: okffiGeocoding,
	filterJSON: filterGeocodingResult,
	markerLocation: true,
	autoType: false,
	autoCollapse: true,
	minLength: 2,
	zoom: 10,
	text: "Osoite...",
	textCancel: "Peru",
	textErr: "Osoitetta ei löytynyt",
	zoom: {
	    animate: false
	},
	circleLocation: false
    }) );

    searchControl._markerLoc.dragging.enable();
    searchControl._markerLoc.on('move', function (e) {
        if (markerNight2012 == undefined ) {
            markerNight2012 = L.marker(searchControl._markerLoc.getLatLng(), { draggable: true} ).addTo(mapNight2012);
            markerDay2030 = L.marker(searchControl._markerLoc.getLatLng(), { draggable: true}).addTo(mapDay2030);
            markerNight2030 = L.marker(searchControl._markerLoc.getLatLng(), { draggable: true}).addTo(mapNight2030);

	    markerNight2012.on('drag', function (e) {
		searchControl._markerLoc.setLatLng(markerNight2012.getLatLng());
		markerDay2030.setLatLng(searchControl._markerLoc.getLatLng());
		markerNight2030.setLatLng(searchControl._markerLoc.getLatLng());
	    });
	    markerDay2030.on('drag', function (e) {
                searchControl._markerLoc.setLatLng(markerDay2030.getLatLng());
                markerNight2012.setLatLng(searchControl._markerLoc.getLatLng());
                markerNight2030.setLatLng(searchControl._markerLoc.getLatLng());
            });
	    markerNight2030.on('drag', function (e) {
                searchControl._markerLoc.setLatLng(markerNight2030.getLatLng());
                markerNight2012.setLatLng(searchControl._markerLoc.getLatLng());
                markerDay2030.setLatLng(searchControl._markerLoc.getLatLng());
            });
        }
    });

    searchControl._markerLoc.on('drag', function (e) {
	markerNight2012.setLatLng(searchControl._markerLoc.getLatLng());
	markerDay2030.setLatLng(searchControl._markerLoc.getLatLng());
	markerNight2030.setLatLng(searchControl._markerLoc.getLatLng());
    });

    // TODO:
    // 1. check if searchControl._markerLoc.getLatLng() is inside any of the polygons in the noise data for each year
    // 2.1. If it is inside a polygon then show dB data in a popup on the corresponding map. 
    // 2.2. If it is not then show "< 45 dB" on the corresponding map.
    //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

    function getColor(i) {
	return i == 0 ? '#ffeda0' :
           i == 1 ? '#fed976' :
           i == 2 ? '#feb24c' :
           i == 3 ? '#fd8d3c' :
           i == 4 ? '#fc4e2a' :
           i == 5 ? '#e31a1c' :
	    '#b10026';
    }

    var legend = L.control({position: 'topleft'});
    legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend');
        var desibels = [45, 50, 55, 60, 65, 70, 75];

    // loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < desibels.length; i++) {
            div.innerHTML +=
            '<i style="background:' + getColor(i) + '"></i> ' +
		desibels[i] + ( desibels[i + 1] ? '&ndash;' + desibels[i + 1] + ' dB<br>' : '&ndash;80 dB');
	}

	return div;
    };
    legend.addTo(mapDay2012);

});
