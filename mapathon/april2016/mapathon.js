
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

    map = L.map('map_canvas', {layers: [osmLayer]});
    L.control.layers(baseMaps).addTo(map);
    L.control.scale().addTo(map);

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

	var areaPoly = L.polygon(latLngs, { color: '#54cc54', fill: false });
	areaPoly.addTo(map);
	map.setView([centerLat, centerLng], 9);

	showPriorityAreas();

	$.getJSON("usernames.json", function (userNames) {
	    
	    //console.log(userNames.length);
	    //console.log(userNames);

	    userNames = userNames.sort();
			    
	    $("#users_heading").html("Contributions by " + userNames.length + " Persons");
	    $("#users_div").html("");
	    for (var i = 0; i < userNames.length; i++) {
		//    console.log(userNames[i]);
		var div = '<div class="col-md-2"><a target="_blank" href="http://tasks.hotosm.org/user/' + userNames[i] + '">' + userNames[i] + '</a></div>';
		$("#users_div").append(div);
	    }
	});

	/*$.getJSON("highways_primary_meta.json", function (result) {
	    var userNames = findUsers(result.elements);

	    $.getJSON("highways_secondary_meta.json", function (result) {
                var temp = findUsers(result.elements);
                addUsers(userNames, temp);
		
		$.getJSON("highways_tertiary_meta.json", function (result) {
		    var temp = findUsers(result.elements);
		    addUsers(userNames, temp);
		    
		    $.getJSON("highways_unclassified_meta.json", function (result) {
			var temp = findUsers(result.elements);
			addUsers(userNames, temp);

			$.getJSON("highways_residential_meta.json", function (result) {
                            var temp = findUsers(result.elements);
                            addUsers(userNames, temp);
			    
			    $.getJSON("landuse_residential_meta.json", function (result) {
				var temp = findUsers(result.elements);
				addUsers(userNames, temp);

				$.getJSON("buildings_bottom_meta.json", function (result) {
                                    var temp = findUsers(result.elements);
                                    addUsers(userNames, temp);
			    
				    $.getJSON("buildings_top_meta.json", function (result) {
					var temp = findUsers(result.elements);
					addUsers(userNames, temp);
				    
					$.getJSON("highways_service_meta.json", function (result) {
					    var temp = findUsers(result.elements);
					    addUsers(userNames, temp);

					    $.getJSON("highways_track_meta.json", function (result) {
						var temp = findUsers(result.elements);
						addUsers(userNames, temp);

						$.getJSON("highways_path_meta.json", function (result) {
						    var temp = findUsers(result.elements);
						    addUsers(userNames, temp);

						    //console.log(userNames.length);
						    console.log(JSON.stringify(userNames));
			    
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
		    });
                });
	    });
	});*/
    });

    $.getJSON("highways_unclassified.json", function (result) {
	    
	var lengthSum = 0;
	var count = 0;
	var duplicateCount = 0;
	//console.log(result);
	var result = calculateRoadStatistics(result.elements, "#un_road_length_div", "#un_road_count_div", '#000', 2, null);
	lengthSum += result.length;
	count += result.createdCount;
	duplicateCount += result.duplicateCount;
	$.getJSON("highways_residential.json", function (result) {
	    //console.log(result);
	    result = calculateRoadStatistics(result.elements, "#res_road_length_div", "#res_road_count_div", '#FFF', 2, null);
	    lengthSum += result.length;
	    count += result.createdCount;
	    duplicateCount += result.duplicateCount;

	    $.getJSON("highways_primary.json", function (result) {
		//console.log(result);
		result = calculateRoadStatistics(result.elements, "#primary_road_length_div", "#primary_road_count_div", '#F00', 4, null);
		lengthSum += result.length;
		count += result.createdCount;
		duplicateCount += result.duplicateCount;

		$.getJSON("highways_secondary.json", function (result) {
		    //console.log(result);
		    result = calculateRoadStatistics(result.elements, "#secondary_road_length_div", "#secondary_road_count_div", '#FFA500', 3, null);
		    lengthSum += result.length;
		    count += result.createdCount;
		    duplicateCount += result.duplicateCount;

		    $.getJSON("highways_tertiary.json", function (result) {
			result = calculateRoadStatistics(result.elements, "#tertiary_road_length_div", "#tertiary_road_count_div", '#FFFF00', 3, null);
			lengthSum += result.length;
			count += result.createdCount;
			duplicateCount += result.duplicateCount;

			$.getJSON("highways_service.json", function (result) {
                            result = calculateRoadStatistics(result.elements, "#service_road_length_div", "#service_road_count_div", '#FFF', 2, null);
			    lengthSum += result.length;
			    count += result.createdCount;
			    duplicateCount += result.duplicateCount;

			    $.getJSON("highways_track.json", function (result) {
				result = calculateRoadStatistics(result.elements, "#tracks_length_div", "#tracks_count_div", '#D27259', 2, "5 2");
				lengthSum += result.length;
				count += result.createdCount;
				duplicateCount += result.duplicateCount;

				$.getJSON("highways_path.json", function (result) {
				    result = calculateRoadStatistics(result.elements, "#paths_length_div", "#paths_count_div", '#D29259', 2, "5 5");
				    lengthSum += result.length;
				    count += result.createdCount;
				    duplicateCount += result.duplicateCount;

				    $("#roads_total_length_div").text("" + Math.round(lengthSum / 1000) + " km");

				    var duplicatePercentage = duplicateCount / count * 100;
				    $("#roads_total_count_div").text("" + count + ", +" + duplicateCount + " modified (" + duplicatePercentage.toFixed(1) + "%)"); 
				});
			    });
			});
		    });
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
	    
	    if (date.getFullYear() == 2016 && date.getMonth() == 3 && date.getDate() == 28 && date.getHours() >= 14) {
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
    
    // Would be feature collection
    var priority_areas = {
    };

    /*L.geoJson(priority_areas, {
	style: function (feature) {
            return {color: "#F00", fill: false, weight: 2, opacity: 0.8};
	}
    }).addTo(map);*/
}

function calculateBuildingStatistics(elements) {
    var buildingNodes = [];
    var buildingNonEmptyCount = 0;
    var buildingsCount = 0;
    //var totalArea = 0;

    var IDs = [];
    var duplicateIDCount = 0;
    
    var buildingObjects = {};

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == "way") {
            if (buildingObjects[elements[i].id] != undefined) { // Show only created buildings i.e. those that are only once in the elements array.            
		delete buildingObjects[elements[i].id];
            }
            else {
		buildingObjects[elements[i].id] = elements[i];
            }

	    buildingsCount++;

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

    //console.log(buildings.length);
    //console.log(duplicateIDCount);
    var duplicatePercentage = (duplicateIDCount / buildingsCount * 100);
    //console.log("Building duplicate %: " + duplicatePercentage); 

    for (var buildingKey in buildingObjects) {
        var building = buildingObjects[buildingKey];
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

    var text = "" + buildingsCount + ", +" + duplicateIDCount + " modified" + " (" + duplicatePercentage.toFixed(1) + "%)";

    $("#building_count_div").text(text);
    
    //$("#res_area_total_area_div").html(Math.round(totalArea) + " m<sup>2</sup>");
    //$("#res_area_avg_area_div").html(Math.round(totalArea / residentialAreaNonEmptyCount) + " m<sup>2</sup>");
}

function calculateResidentialAreaStatistics(elements) {
    var residentialAreaNodes = [];
    var residentialAreaCount = 0;
    var residentialAreaNonEmptyCount = 0;
    var totalArea = 0;

    var IDs = [];
    var duplicateIDCount = 0;

    var residentialAreaObjects = {};

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == "way") {
	    if (residentialAreaObjects[elements[i].id] != undefined) { // Show only created residential areas i.e. those that are only once in the elements array.
		delete residentialAreaObjects[elements[i].id];
            }
            else {
		residentialAreaObjects[elements[i].id] = elements[i];
            }
	    residentialAreaCount++;

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

    //console.log(residentialAreas.length);
    //console.log(duplicateIDCount);
    var duplicatePercentage = (duplicateIDCount / residentialAreaCount * 100);
    //console.log("Residential area duplicate %: " + duplicatePercentage);

    for (var key in residentialAreaObjects) {
        var residentialArea = residentialAreaObjects[key];
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

    var text = "" + residentialAreaCount + ", +" + duplicateIDCount + " modified" + " (" + duplicatePercentage.toFixed(1) + "%)";
    $("#res_area_count_div").text(text);
    $("#res_area_total_area_div").html(Math.round(totalArea) + " m<sup>2</sup>");
    $("#res_area_avg_area_div").html(Math.round(totalArea / residentialAreaNonEmptyCount) + " m<sup>2</sup>");
}

function calculateRoadStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray) {
    var highwayNodes = [];
    var highWaysCount = 0;
    var totalRoadLength = 0;
    
    var IDs = [];
    var duplicateIDCount = 0;

    var highWayObjects = {};

    for (var i = 0; i < elements.length; i++) {
	if (elements[i].type == "way") {
	    highWaysCount++;
	    if (highWayObjects[elements[i].id] != undefined) { // Show only created highways i.e. those that are only once in the elements array.
		delete highWayObjects[elements[i].id];
	    }
	    else {
		highWayObjects[elements[i].id] = elements[i];
	    }

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

    //console.log(highWays.length);
    //console.log(duplicateIDCount);
    var duplicatePercentage = (duplicateIDCount / highWaysCount * 100);
    //console.log("Highway duplicate %: " + duplicatePercentage);

    //console.log(highwayNodes.length);
    for (var key in highWayObjects) {
	var highWay = highWayObjects[key];
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
	var polyLine = L.polyline(latLngs, {weight: weight, color: mapLineColor, dashArray: dashArray });
	var highwayTextSuffix = "";
	if (highWay.tags.highway != "track" && highWay.tags.highway != "path") {
	    highwayTextSuffix = " road";
	}
	var linkText = highWay.tags.highway + highwayTextSuffix + ', id: ' + highWay.id;
	//var linkText = '<a href="http://www.openstreetmap.org/way/' + highWay.id + '" target="_blank">View on openstreetmap.org</a>';
	polyLine.bindPopup(linkText);
	polyLine.addTo(map);
	
	for (var j = 0; j < latLngs.length - 1; j++) {
	    var lat1 = latLngs[j].lat;
	    var lon1 = latLngs[j].lng;
	    var lat2 = latLngs[j+1].lat;
	    var lon2 = latLngs[j+1].lng;
	    roadDistance += distance(lat1,lon1,lat2,lon2) * 1000;
	}

	totalRoadLength += roadDistance;
    }
    
    var length = totalRoadLength / 1000;
    var text = "" + length.toFixed(1) + " km";
    $(lengthHtmlElementID).text(text);
    //console.log(totalRoadLength);

    text = "" + (highWaysCount - duplicateIDCount) + ", +" + duplicateIDCount + " modified (" + duplicatePercentage.toFixed(1) + "%)";
    $(countHtmlElementID).text(text);

    return { "length": totalRoadLength, "createdCount": (highWaysCount - duplicateIDCount), "duplicateCount": duplicateIDCount };
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
