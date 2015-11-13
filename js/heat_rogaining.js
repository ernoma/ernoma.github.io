
var INITIAL_LAT = 61.46;
var INITIAL_LON = 23.766667;

var map = undefined;

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
    "OpenStreetMap": osmLayer,
    "Taustakartta, Maanmittauslaitos": mmlTaustaLayer,
    "Ilmakuva, Maanmittauslaitos": mmlOrtoLayer,
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

var control_points = undefined;

var fillari_teams = [];
var fillari_totals = [];

var tossu_teams = [];
var tossu_totals = [];

var fillari_data = [];
var tossu_data = [];
var both_data = [];

var all_markers = [];


$(document).ready(function(){

    calculateFillariVisits()
	.then(calculateTossuVisits)
	.then(loadControlPoints)
	.then(createMap);
});

function loadControlPoints() {
    var deferred = Q.defer();

    d3.csv('/data/yo_roga_2015_rastit_korjattu_muokattu.csv', function(data) {	
	//console.log(data);
	control_points = data;

	deferred.resolve();
    });

    return deferred.promise;
}

function createMap() {
    	d3.csv('/data/yo_roga_2015_kaynnit.csv', function(data2) {
	    
	    //console.log(data2);
	    
	    for (var i = 0; i < control_points.length; i++) {
		control_points[i].lat = Number(control_points[i].lat);
		control_points[i].lng = Number(control_points[i].lng);
		for (var j = 0; j < data2.length; j++) {
		    if (control_points[i].name == data2[j].name) {
			control_points[i].visits = Number(data2[j].visits);
			both_data.push(control_points[i]);
			break;
		    }
		}
		if (control_points[i].name != '3TESTI1' && control_points[i].name != '3TESTI2' && control_points[i].name != '3TESTI3' && control_points[i].name != 'REKISTERÖINTI') {
		    var fillari_clone = (JSON.parse(JSON.stringify(control_points[i])));
		    if (fillari_totals[control_points[i].name] != undefined) {
			fillari_clone.visits = fillari_totals[control_points[i].name].count;
		    }
		    else {
			fillari_clone.visits = 0;
		    }
		    fillari_data.push(fillari_clone);
		    var tossu_clone = (JSON.parse(JSON.stringify(control_points[i])));
		    if (tossu_totals[control_points[i].name] != undefined) {
			tossu_clone.visits = tossu_totals[control_points[i].name].count;
		    }
		    else {
			tossu_clone.visits = 0;
		    }
		    tossu_data.push(tossu_clone);
		}
	    }

	    heatmapLayer = new HeatmapOverlay(cfg);
	    //console.log(heatmapLayer);

	    map = L.map('map_canvas', {layers: [osmLayer, heatmapLayer]}).setView([INITIAL_LAT, INITIAL_LON], 12);

	    L.control.layers(baseMaps).addTo(map);
	    map.on('baselayerchange', function(event) {
		if (event.layer == mmlOrtoLayer) {
		    if (map.getZoom() < 13) {
			map.setZoom(13);
		    }
		}
	    });

	    var dataSetControl = L.control({position: 'topright'});
	    dataSetControl.onAdd = function (map) {
		var div = L.DomUtil.create('div');
		div.innerHTML = '<select id="data_set_select"><option>Fillari+Tossu</option><option>Fillari</option><option>Tossu</option></select>';
		return div;
	    };
	    dataSetControl.addTo(map);
	    $("#data_set_select").on('change', function(event) {
		//console.log(event);
		//console.log($(this)[0].selectedIndex);
		for (var i = 0; i < all_markers.length; i++) {
		    map.removeLayer(all_markers[i]);
		}
		switch ($(this)[0].selectedIndex) {
		case 0: // both
		    heat_data = { data: both_data };
		    addMarkers(both_data);
		    break;
		case 1: // fillari
		    heat_data = { data: fillari_data };
		    addMarkers(fillari_data);
		    break;
		case 2: // tossu
		    heat_data = { data: tossu_data };
		    addMarkers(tossu_data);
		    break;
		}
		heatmapLayer.setData(heat_data);
	    });

	    heat_data = { data: both_data };
	    heatmapLayer.setData(heat_data);

	    heat_slider = L.control.slider(function(value) {
		//console.log(value);

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

	    //console.log(both_data);
	    
	    addMarkers(both_data);
	});
}

function addMarkers(data) {

    var redIcon = L.AwesomeMarkers.icon({
	prefix: 'fa',
	icon: 'flag',
	markerColor: 'red'
    });
    var blueIcon = L.AwesomeMarkers.icon({
	prefix: 'fa',
        icon: 'flag',
        markerColor: 'cadetblue'
    });

    for (var i = 0; i < data.length; i++) {
	var marker = L.marker([data[i].lat, data[i].lng], {title: data[i].name, icon: data[i].visits == 0 ? redIcon : blueIcon }).bindPopup('<p>' + data[i].name + '<br>' + data[i].visits + ' käyntiä<p>').addTo(map);
	all_markers.push(marker);
    }
}

function calculateFillariVisits() {

    var deferred = Q.defer();

    d3.csv('/data/yo_roga_2015_fillari.csv', function (data) {
	//console.log(data);

	for (var i = 0; i < data.length; i++) {
	    if (data[i].tiimi != "") {
		
		var team = {
		    name: data[i].tiimi, 
		    rows: [data[i]]
		};

		fillari_teams.push(team);
	    }
	    else {
		fillari_teams[fillari_teams.length - 1].rows.push(data[i]);
	    }
	    
	    if (fillari_totals[data[i].rasti] != undefined) {
		fillari_totals[data[i].rasti].count++;
	    }
	    else {
		fillari_totals[data[i].rasti] = { count: 1 };
	    }
	}

	//console.log(fillari_teams);
	//console.log(fillari_totals);

	delete fillari_totals['03 TESTI1'];
        delete fillari_totals['03 TESTI2'];
        delete fillari_totals['03 TESTI3'];

	deferred.resolve();
    });
    
    return deferred.promise;
}

function calculateTossuVisits() {
    
    var deferred = Q.defer();

    d3.csv('/data/yo_roga_2015_tossu.csv', function (data) {
        //console.log(data);
        for (var i = 0; i < data.length; i++) {
            if (data[i].tiimi != "") {

                var team = {
                    name: data[i].tiimi,
                    rows: [data[i]]
                };

                tossu_teams.push(team);
            }
            else {
                tossu_teams[tossu_teams.length - 1].rows.push(data[i]);
            }

            if (tossu_totals[data[i].rasti] != undefined) {
                tossu_totals[data[i].rasti].count++;
            }
            else {
                tossu_totals[data[i].rasti] = { count: 1 };
            }
        }

        //console.log(tossu_teams);
        //console.log(tossu_totals);

	delete tossu_totals['03 TESTI1'];
	delete tossu_totals['03 TESTI2'];
	delete tossu_totals['03 TESTI3'];

	deferred.resolve();
    });

    return deferred.promise;
}
