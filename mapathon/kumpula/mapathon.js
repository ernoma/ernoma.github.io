
var map = undefined;

var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18
});

var hotLayer = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>',
    maxZoom: 18
});

var bingLayer = new L.BingLayer('AuJOP1AQnHgJ50Co_d_mnn8ZSyoCN71Mcv6Ve3S_xOQqyyrBFaWnNIcy-6GX-nX_', {type: 'AerialWithLabels'});

var baseMaps = {
    "OpenStreetMap": osmLayer,
    "Humanitarian": hotLayer,
    "Bing aerial": bingLayer
}

var unclassifiedHighways = [];
var unclassifiedHighwayNodes = [];

$(document).ready(function () {
    
    var latSum = 0;
    var lngSum = 0;

    d3.csv("../coords.csv", function (data) {
	//console.log(data);

	var latLngs = [];
	//var polyString = "";

	for (var i = 0; i < data.length; i++) {
	    latSum += Number(data[i].lat);
	    lngSum += Number(data[i].lon);
	    latLngs.push(L.latLng(data[i].lat, data[i].lon));
	    //polyString += data[i].lat + " " + data[i].lon + " ";
	}
	//console.log(polyString);

	var centerLat = latSum / data.length;
	var centerLng = lngSum / data.length;

	map = L.map('map_canvas', {layers: [hotLayer]}).setView([centerLat, centerLng], 8);
	L.control.layers(baseMaps).addTo(map);

	L.control.scale().addTo(map);

	var areaPoly = L.polygon(latLngs, { color: '#54cc54', fill: false });
	areaPoly.addTo(map);

	$.getJSON("highways_unclassified.json", function (result) {
	    //console.log(result);
	    calculateRoadStatistics(result.elements, "#un_road_length_div", '#F30');	    
	});
	$.getJSON("highways_residential.json", function (result) {
            //console.log(result);
            calculateRoadStatistics(result.elements, "#res_road_length_div", '#A80');
        });

	$.getJSON("landuse_residential.json", function (result) {
            //console.log(result);
	    calculateResidentialAreaStatistics(result.elements);
	});
    });

});

function calculateResidentialAreaStatistics(elements) {
    var residentialAreas = [];
    var residentialAreaNodes = [];
    var residentialAreaNonEmptyCount = 0;
    var totalArea = 0;

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == "way") {
            residentialAreas.push(elements[i]);
        }
        else if(elements[i].type == "node") {
            residentialAreaNodes.push(elements[i]);
        }
    }

    for (var i = 0; i < residentialAreas.length; i++) {
        var residentialArea = residentialAreas[i];
        var area = 0;
        var latLngs = [];
        for (var j = 0; j < residentialArea.nodes.length; j++) {
            for (var k = 0; k < residentialAreaNodes.length; k++) {
                if (residentialArea.nodes[j] == residentialAreaNodes[k].id) {
                    latLngs.push(L.latLng(residentialAreaNodes[k].lat, residentialAreaNodes[k].lon));
                    break;
                }
            }
        }
	if (latLngs.length > 2) {
	    residentialAreaNonEmptyCount++;
	    var polygon = L.polygon(latLngs, {color: '#FFFF00', weight: 2 });
	    var linkText = 'Residental area, id: ' + residentialArea.id;
	    //var linkText = '<a href="http://www.openstreetmap.org/way/' + residentialArea.id + '" target="_blank">View on openstreetmap.org</a>';
	    polygon.bindPopup(linkText);
	    polygon.addTo(map);
	    area = L.GeometryUtil.geodesicArea(latLngs); // in squaremeters
	    totalArea += area;
	}
    }

    $("#res_area_count_div").text(residentialAreaNonEmptyCount);
    $("#res_area_total_area_div").html(Math.round(totalArea) + " m<sup>2</sup>");
    $("#res_area_avg_area_div").html(Math.round(totalArea / residentialAreaNonEmptyCount) + " m<sup>2</sup>");
}

function calculateRoadStatistics(elements, htmlElementID, mapLineColor) {
    var highWays = [];
    var highwayNodes = [];
    var totalRoadLength = 0;
    
    for (var i = 0; i < elements.length; i++) {
	if (elements[i].type == "way") {
	    highWays.push(elements[i]);
	}
	else if(elements[i].type == "node") {
	    highwayNodes.push(elements[i]);
	}
    }
    //console.log(highWays.length);
    //console.log(highwayNodes.length);
    for (var i = 0; i < highWays.length; i++) {
	var highWay = highWays[i];
	var roadDistance = 0;
	var latLngs = [];
	for (var j = 0; j < highWay.nodes.length; j++) {
	    for (var k = 0; k < highwayNodes.length; k++) {
		if (highWay.nodes[j] == highwayNodes[k].id) {
		    latLngs.push(L.latLng(highwayNodes[k].lat, highwayNodes[k].lon));
		    break;
		}
	    }
	}
	if (highWay.id != 26239440) {
	    var polyLine = L.polyline(latLngs, {weight: 2, color: mapLineColor});
	    var linkText = highWay.tags.highway + ' road, id: ' + highWay.id;
	    //var linkText = '<a href="http://www.openstreetmap.org/way/' + highWay.id + '" target="_blank">View on openstreetmap.org</a>';
	    polyLine.bindPopup(linkText);
	    polyLine.addTo(map);
	
	    for (var j = 0; j < latLngs.length - 1; j++) {
		var lat1 = latLngs[j].lat;
		var lon1 = latLngs[j].lng;
		var lat2 = latLngs[j+1].lat;
		var lon2 = latLngs[j+1].lng;
		//roadDistance += getDistanceFromLatLonInMeters(lat1,lon1,lat2,lon2);
		roadDistance += distance(lat1,lon1,lat2,lon2) * 1000;
	    }
	    //if (highWay.id == 381407386) {
	    //    console.log(highWay);
	    //    console.log(latLngs);
	    //}
	    totalRoadLength += roadDistance;
	}
    }
    
    $(htmlElementID).text("" + Math.round(totalRoadLength / 1000) + " km");
    //console.log(totalRoadLength);
}

//                                                                                                                          
// From http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
//   
/*function getDistanceFromLatLonInMeters(lat1,lon1,lat2,lon2) {
  var R = 6371*1000; // Radius of the earth in m
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}*/

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
