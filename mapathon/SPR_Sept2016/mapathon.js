
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
	map.setView([centerLat, centerLng], 8);

	showPriorityAreas();

	$.getJSON("usernames.json", function (userNames) {
	    
	    //console.log(userNames.length);
	    //console.log(userNames);

	    userNames = userNames.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	    });
			    
	    $("#users_heading").html("Contributions by " + userNames.length + " Persons");
	    $("#users_div").html("");

	    //var words = [];

	    for (var i = 0; i < userNames.length; i++) {
		//    console.log(userNames[i]);
		var div = '<div class="col-md-2"><a target="_blank" href="http://tasks.hotosm.org/user/' + userNames[i] + '">' + userNames[i] + '</a></div>';
		$("#users_div").append(div);

		//words.push({text: userNames[i], weight: 0.02});
	    }
	    /*$("#users_div").jQCloud(words, {
		autoResize: true,
		shape: "rectangular",
		fontSize: {
		    from: 0.04,
		    to: 0.02
		}
	    });*/
	});

	/*$.getJSON("highways_unclassified_meta.json", function (result) {
	    var userNames = findUsers(result.elements);

	    $.getJSON("highways_path_meta.json", function (result) {
                var temp = findUsers(result.elements);
                addUsers(userNames, temp);
		
		$.getJSON("landuse_residential_meta.json", function (result) {
		    var temp = findUsers(result.elements);
		    addUsers(userNames, temp);
		    
		    $.getJSON("waterways_drystream_meta.json", function (result) {
			var temp = findUsers(result.elements);
			addUsers(userNames, temp);

			$.getJSON("waterways_stream_meta.json", function (result) {
                            var temp = findUsers(result.elements);
                            addUsers(userNames, temp);
			    
			    $.getJSON("landuse_residential_meta.json", function (result) {
				var temp = findUsers(result.elements);
				addUsers(userNames, temp);

				$.getJSON("buildings_meta.json", function (result) {
                                    var temp = findUsers(result.elements);
                                    addUsers(userNames, temp);
			    
				    $.getJSON("waterways_river_meta.json", function (result) {
					var temp = findUsers(result.elements);
					addUsers(userNames, temp);

					$.getJSON("highways_track_meta.json", function (result) {
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

    $.getJSON("waterways_river.json", function (result) {
	var lengthSum = 0;
        var count = 0;
        var duplicateCount = 0;
        //console.log(result);
	var result = calculateWaterwayStatistics(result.elements, "#rivers_length_div", "#rivers_count_div", '#66c2ff', 4, null);
	lengthSum += result.length;
        count += result.createdCount;
        duplicateCount += result.duplicateCount;
	$.getJSON("waterways_stream.json", function (result) {
	    result = calculateWaterwayStatistics(result.elements, "#streams_length_div", "#streams_count_div", '#66c2ff', 2, null);
	    lengthSum += result.length;
            count += result.createdCount;
            duplicateCount += result.duplicateCount;
	    
	    $.getJSON("waterways_drystream.json", function (result) {
		result = calculateWaterwayStatistics(result.elements, "#drystreams_length_div", "#drystreams_count_div", '#66c2ff', 2, "2 5");
		lengthSum += result.length;
		count += result.createdCount;
		duplicateCount += result.duplicateCount;

		$("#waterways_total_length_div").text("" + Math.round(lengthSum / 1000) + " km");

                var duplicatePercentage = duplicateCount / count * 100;
                $("#waterways_total_count_div").text("" + count + ", +" + duplicateCount + " modified (" + duplicatePercentage.toFixed(1) + "%)");
		
	    });
	});
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
	    
	    if (date.getFullYear() == 2016 && date.getMonth() == 8 && date.getDate() == 21 && date.getHours() >= 17) {
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
    
    var priority_areas = {
	"type": "FeatureCollection", "features": [{"geometry": {"type": "Polygon", "coordinates": [[[27.14447021484375, -17.81145608856447], [27.28866577148438, -17.67542781833938], [27.50701904296875, -17.82975968372921], [27.48641967773438, -17.95521930428781], [27.38616943359375, -18.03619806341487], [27.2625732421875, -18.01791578799871], [27.07855224609375, -17.97873309555617], [27.14447021484375, -17.81145608856447]]]}, "type": "Feature", "id": null, "properties": {}}]
    };

    L.geoJson(priority_areas, {
	style: function (feature) {
            return {color: "#F00", fill: false, weight: 2, opacity: 0.8};
	}
    }).addTo(map);
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

function calculateWaterwayStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray) {
    return calculateWayStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray);
}

function calculateRoadStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray) {
    return calculateWayStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray);
}

function calculateWayStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray) {
    var wayNodes = [];
    var waysCount = 0;
    var totalWayLength = 0;
    
    var IDs = [];
    var duplicateIDCount = 0;

    var wayObjects = {};

    for (var i = 0; i < elements.length; i++) {
	if (elements[i].type == "way") {
	    waysCount++;
	    if (wayObjects[elements[i].id] != undefined) { // Show only created ways i.e. those that are only once in the elements array.
		delete wayObjects[elements[i].id];
	    }
	    else {
		wayObjects[elements[i].id] = elements[i];
	    }

	    if (IDs.indexOf(elements[i].id) != -1) {
                duplicateIDCount++;
            }
            else {
                IDs.push(elements[i].id);
            }
	}
	else if(elements[i].type == "node") {
	    wayNodes.push(elements[i]);
	}
    }

    //console.log(duplicateIDCount);
    var duplicatePercentage = 0;
    if (waysCount > 0) {
	duplicatePercentage = (duplicateIDCount / waysCount * 100);
    }
    //console.log("Way duplicate %: " + duplicatePercentage);

    //console.log(wayNodes.length);
    for (var key in wayObjects) {
	var wayObject = wayObjects[key];
	var wayDistance = 0;
	var latLngs = [];
	for (var j = 0; j < wayObject.nodes.length; j++) {
	    for (var k = 0; k < wayNodes.length; k++) {
		if (wayObject.nodes[j] == wayNodes[k].id) {
		    latLngs.push(L.latLng(wayNodes[k].lat, wayNodes[k].lon));
		    break;
		}
	    }
	}
	var polyLine = L.polyline(latLngs, {weight: weight, color: mapLineColor, dashArray: dashArray });
	var wayTextSuffix = "";
	var linkText = "";
	if (wayObject.tags.highway != undefined) {
	    if (wayObject.tags.highway != "track" && wayObject.tags.highway != "path") {
		wayTextSuffix = " road";
	    }
	    linkText = wayObject.tags.highway + wayTextSuffix + ', id: ' + wayObject.id;
	    //var linkText = '<a href="http://www.openstreetmap.org/way/' + wayObject.id + '" target="_blank">View on openstreetmap.org</a>';
	}
	else if (wayObject.tags.waterway != undefined) {
	    linkText = wayObject.tags.waterway + wayTextSuffix + ', id: ' + wayObject.id;
	    //console.log(linkText);
	}
	polyLine.bindPopup(linkText);
	polyLine.addTo(map);
	
	for (var j = 0; j < latLngs.length - 1; j++) {
	    var lat1 = latLngs[j].lat;
	    var lon1 = latLngs[j].lng;
	    var lat2 = latLngs[j+1].lat;
	    var lon2 = latLngs[j+1].lng;
	    wayDistance += distance(lat1,lon1,lat2,lon2) * 1000;
	}

	totalWayLength += wayDistance;
    }
    
    var length = totalWayLength / 1000;
    var text = "" + length.toFixed(1) + " km";
    $(lengthHtmlElementID).text(text);
    //console.log(totalWayLength);

    text = "" + (waysCount - duplicateIDCount) + ", +" + duplicateIDCount + " modified (" + duplicatePercentage.toFixed(1) + "%)";
    $(countHtmlElementID).text(text);

    return { "length": totalWayLength, "createdCount": (waysCount - duplicateIDCount), "duplicateCount": duplicateIDCount };
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
