
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

    d3.csv("coords.csv", function (data) {
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

	map = L.map('map_canvas', {layers: [bingLayer]}).setView([centerLat, centerLng], 8);
	L.control.layers(baseMaps).addTo(map);

	L.control.scale().addTo(map);

	var areaPoly = L.polygon(latLngs, { color: '#54cc54', fill: false });
	areaPoly.addTo(map);

	showPriorityAreas();

	$.getJSON("buildings_meta.json", function (result) {
	    var userNames = findUsers(result.elements);

	    $.getJSON("highways_path_meta.json", function (result) {
		var temp = findUsers(result.elements);
		addUsers(userNames, temp);

		$.getJSON("highways_residential_meta.json", function (result) {
                    var temp = findUsers(result.elements);
                    addUsers(userNames, temp);

		    $.getJSON("highways_track_meta.json", function (result) {
			var temp = findUsers(result.elements);
			addUsers(userNames, temp);

			$.getJSON("highways_unclassified_meta.json", function (result) {
			    var temp = findUsers(result.elements);
			    addUsers(userNames, temp);

			    $.getJSON("landuse_residential_meta.json", function (result) {
				var temp = findUsers(result.elements);
				addUsers(userNames, temp);



				//console.log(userNames.length);

				$("#users_heading").html("Contributions by " + userNames.length + " Persons");
				$("#users_div").html("");
				for (var i = 0; i < userNames.length; i++) {
				//    console.log(userNames[i]);
				    var div = '<div class="col-md-2"><a target="_blank" href="http://tasks.hotosm.org/user/' + userNames[i] + '">' + userNames[i] + '</a></div>';
				    $("#users_div").append(div);
				}
			    });
			});
                    });
		});
	    });
	});
    });

    $.getJSON("highways_unclassified.json", function (result) {
	    
	var lengthSum = 0;
	//console.log(result);
	lengthSum = calculateRoadStatistics(result.elements, "#un_road_length_div", '#000', 2, null);	    
	$.getJSON("highways_residential.json", function (result) {
	    //console.log(result);
	    lengthSum += calculateRoadStatistics(result.elements, "#res_road_length_div", '#FFF', 4, null);
	    $.getJSON("highways_track.json", function (result) {
		//console.log(result);
		lengthSum += calculateRoadStatistics(result.elements, "#track_road_length_div", '#E7D4A0', 3, "5 1");
		$.getJSON("highways_path.json", function (result) {
		    //console.log(result);
		    lengthSum += calculateRoadStatistics(result.elements, "#path_road_length_div", '#E7D4A0', 4, "5 5");
		    $("#roads_total_length_div").text("" + Math.round(lengthSum / 1000) + " km");
		    
		});
	    });
	});
    });
    
    $.getJSON("landuse_residential.json", function (result) {
        //console.log(result);
	calculateResidentialAreaStatistics(result.elements);
    });
    
    $.getJSON("buildings.json", function (result) {
        //console.log(result);
        calculateBuildingStatistics(result.elements);
    });
});

function addUsers(userNames, source) {
    for (var i = 0; i < source.length; i++) {
        if (userNames.indexOf(source[i]) == -1) {
            userNames.push(source[i]);
        }
    }
    return userNames;
}

function findUsers(elements) {
    var userNames = [];

    for (var i = 0; i < elements.length; i++) {
	if (elements[i].type == "way") {
	    var editDate = Date.parse(elements[i].timestamp);
	    var date = new Date(editDate);
	    
	    if (date.getFullYear() == 2016 && date.getMonth() == 2 && date.getDate() == 5 && date.getHours() >= 10) {
		if (userNames.indexOf(elements[i].user) == -1) {
		    userNames.push(elements[i].user);
		    //console.log(elements[i].user);
		}
	    }
	}
    }

    return userNames;
}

function showPriorityAreas() {
    var priority_areas = {"type": "FeatureCollection", "features": [{"geometry": {"type": "Polygon", "coordinates": [[[0.806121826171875, 9.352867708269317], [0.729217529296875, 9.325765958926807], [0.7196044921874999, 9.233604298380849], [0.7525634765625, 9.17124596242516], [0.81573486328125, 9.197003998984497], [0.863800048828125, 9.25529157227662], [0.84320068359375, 9.329831355689189], [0.806121826171875, 9.352867708269317]]]}, "type": "Feature", "id": null, "properties": {}}, {"geometry": {"type": "Polygon", "coordinates": [[[0.736083984375, 9.43957908942936], [0.79376220703125, 9.385387020096225], [0.8802795410156249, 9.393516371824855], [0.888519287109375, 9.499180522706919], [0.789642333984375, 9.55606312481075], [0.720977783203125, 9.501889432784711], [0.736083984375, 9.43957908942936]]]}, "type": "Feature", "id": null, "properties": {}}, {"geometry": {"type": "Polygon", "coordinates": [[[0.6207275390625, 9.768611091236496], [0.534210205078125, 9.725300127953927], [0.52459716796875, 9.634599651357629], [0.591888427734375, 9.557417356841308], [0.718231201171875, 9.60074993224686], [0.736083984375, 9.722593006167342], [0.6207275390625, 9.768611091236496]]]}, "type": "Feature", "id": null, "properties": {}}]};

    L.geoJson(priority_areas, {
	style: function (feature) {
            return {color: "#F00", fill: false, weight: 2, opacity: 0.8};
	}
    }).addTo(map);
}

function calculateBuildingStatistics(elements) {
    var buildings = [];
    var buildingNodes = [];
    var buildingNonEmptyCount = 0;
    //var totalArea = 0;

    var IDs = [];
    var duplicateIDCount = 0;
    

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == "way") {
            buildings.push(elements[i]);

	    if (IDs.indexOf(elements[i].id) != -1) {
		duplicateIDCount++;
	    }
	    else {
		IDs.push(elements[i].id);
	    }
        }
        else if(elements[i].type == "node") {
            buildingNodes.push(elements[i]);
        }
    }

    console.log(buildings.length);
    console.log(duplicateIDCount);
    console.log("Building duplicate %: " + (duplicateIDCount / buildings.length * 100)); 

    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        //var area = 0;
        var latLngs = [];
        for (var j = 0; j < building.nodes.length; j++) {
            for (var k = 0; k < buildingNodes.length; k++) {
                if (building.nodes[j] == buildingNodes[k].id) {
                    latLngs.push(L.latLng(buildingNodes[k].lat, buildingNodes[k].lon));
                    break;
                }
            }
        }
        if (latLngs.length > 2) {
            buildingNonEmptyCount++;
            var polygon = L.polygon(latLngs, {color: '#FF0000', weight: 2 });
            var linkText = 'Building, id: ' + building.id;
            //var linkText = '<a href="http://www.openstreetmap.org/way/' + building.id + '" target="_blank">View on openstreetmap.org</a>';
            polygon.bindPopup(linkText);
            polygon.addTo(map);
            //area = L.GeometryUtil.geodesicArea(latLngs); // in squaremeters
            //totalArea += area;
        }
    }

    $("#building_count_div").text(buildingNonEmptyCount);
    //$("#res_area_total_area_div").html(Math.round(totalArea) + " m<sup>2</sup>");
    //$("#res_area_avg_area_div").html(Math.round(totalArea / residentialAreaNonEmptyCount) + " m<sup>2</sup>");
}

function calculateResidentialAreaStatistics(elements) {
    var residentialAreas = [];
    var residentialAreaNodes = [];
    var residentialAreaNonEmptyCount = 0;
    var totalArea = 0;

    var IDs = [];
    var duplicateIDCount = 0;

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == "way") {
            residentialAreas.push(elements[i]);

	    if (IDs.indexOf(elements[i].id) != -1) {
                duplicateIDCount++;
            }
            else {
                IDs.push(elements[i].id);
            }
        }
        else if(elements[i].type == "node") {
            residentialAreaNodes.push(elements[i]);
        }
    }

    console.log(residentialAreas.length);
    console.log(duplicateIDCount);
    console.log("Residential area duplicate %: " + (duplicateIDCount / residentialAreas.length * 100));

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

function calculateRoadStatistics(elements, htmlElementID, mapLineColor, weight, dashArray) {
    var highWays = [];
    var highwayNodes = [];
    var totalRoadLength = 0;
    
    var IDs = [];
    var duplicateIDCount = 0;

    for (var i = 0; i < elements.length; i++) {
	if (elements[i].type == "way") {
	    highWays.push(elements[i]);

	    if (IDs.indexOf(elements[i].id) != -1) {
                duplicateIDCount++;
            }
            else {
                IDs.push(elements[i].id);
            }
	}
	else if(elements[i].type == "node") {
	    highwayNodes.push(elements[i]);
	}
    }

    console.log(highWays.length);
    console.log(duplicateIDCount);
    console.log("Highway duplicate %: " + (duplicateIDCount / highWays.length * 100));

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
	if (highWay.id != 367398810) {
	    var polyLine = L.polyline(latLngs, {weight: weight, color: mapLineColor, dashArray: dashArray });
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

    return totalRoadLength;
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
