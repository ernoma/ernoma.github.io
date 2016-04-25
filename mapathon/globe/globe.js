
var earth = undefined;

$(document).ready(function () {
    earth = new WE.map('earth');
    WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(earth);
    earth.setView([0, 0], 3);

    getProjects();
});

function getProjects() {
    $.getJSON('https://loseourway.herokuapp.com/hotosmprojects.json', function (data) {
	console.log(data);

	/*L.geoJson(data, {
	    onEachFeature: function (feature, layer) {
		console.log(feature);
		
	    }
	});*/

	for (var i = 0; i < data.features.length && i < 10; i++) {
	    var polygons = data.features[i].geometry.coordinates;
	    //console.log(polygons);

	    var minLat = Number.MAX_VALUE;
	    var minLng = Number.MAX_VALUE;
	    var maxLat = -Number.MAX_VALUE;
	    var maxLng = -Number.MAX_VALUE;

	    for (var j = 0; j < polygons.length; j++) {
		var reversed = [];

		for (var k = 0; k < polygons[j][0].length; k++) {
		    //console.log(polygons[j][0][k]);
		    minLng = polygons[j][0][k][0] < minLng ? polygons[j][0][k][0] : minLng;
		    maxLng = polygons[j][0][k][0] > maxLng ? polygons[j][0][k][0] : maxLng;
		    minLat = polygons[j][0][k][1] < minLat ? polygons[j][0][k][1] : minLat;
		    maxLat = polygons[j][0][k][1] > maxLat ? polygons[j][0][k][1] : maxLat;
		    reversed.push(polygons[j][0][k].reverse());
		}
		WE.polygon(reversed, {color: '#a00', fillColor: '#c00', opacity: 1, fillOpacity: 0.7, weight: 1}).addTo(earth);
	    }
	    
	    //console.log([minLat, maxLat, minLng, maxLng]);
	    var centerLat = (minLat + maxLat) / 2;
	    var centerLng = (minLng + maxLng) / 2;
	    
	    var marker = WE.marker([centerLat, centerLng]).addTo(earth);
	    marker.bindPopup('<a href="https://tasks.hotosm.org/project/' + data.features[i].id + '" target="_blank">#' +
			     + data.features[i].id + " " + data.features[i].properties.name + '</b>');
	    
	}
    });
}
