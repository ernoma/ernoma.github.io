
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

var roadStats = {
    whenApplyCountRemaining: undefined,
    lengthSum: 0,
    count: 0,
    modifiedCount: 0
}

$(document).ready(function () {
    
    map = L.map('map_canvas', {layers: [osmLayer]});
    L.control.layers(baseMaps).addTo(map);
    L.control.scale().addTo(map);

    readCoords("output.geojson", function (data) {
	//console.log(data);

	var areaPoly = L.polygon(data, { color: '#54cc54', fill: false });
	areaPoly.addTo(map);
	map.fitBounds(areaPoly.getBounds());

	//showPriorityAreas();

	/*$.getJSON("usernames.json", function (userNames) {
	    
	    //console.log(userNames.length);
	    //console.log(userNames);

	    userNames = userNames.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	    });
			    
	    $("#users_heading").html("Edits by " + userNames.length + " Persons");
	    $("#users_div").html("");

	    //var words = [];

	    for (var i = 0; i < userNames.length; i++) {
		//    console.log(userNames[i]);
		var div = '<div class="col-sm-2"><a target="_blank" href="http://tasks.hotosm.org/user/' + userNames[i] + '">' + userNames[i] + '</a></div>';
		$("#users_div").append(div);

		//words.push({text: userNames[i], weight: 0.02});
	    }
	});*/	
	
	var data_dirs = ["bangladesh/"];
	//createRoadStatistics(data_dirs);
	//createResidentialAreaStatistics(data_dirs);
	createBuildingStatistics(data_dirs);	
    });
});


function showPriorityAreas() {
    
    var priority_areas = {
	
    };

    L.geoJson(priority_areas, {
	style: function (feature) {
            return {color: "#F00", fill: false, weight: 2, opacity: 0.8};
	}
    }).addTo(map);
}

function createRoadStatistics(data_dirs) {
    
    var highwayJSONCalls = {
	primary: [],
	secondary: [],
	tertiary: [],
	unclassified: [],
	residential: [],
	service: [],
	track: [],
	path: [],
	footway: [],
	road: []
    };

    roadStats.whenApplyCountRemaining = 10;
    
    for (var d = 0; d < data_dirs.length; d++) {
	highwayJSONCalls.primary.push(readJSONData(data_dirs[d], "highways_primary.json"));
	highwayJSONCalls.secondary.push(readJSONData(data_dirs[d], "highways_secondary.json"));
	highwayJSONCalls.tertiary.push(readJSONData(data_dirs[d], "highways_tertiary.json"));
	highwayJSONCalls.unclassified.push(readJSONData(data_dirs[d], "highways_unclassified.json"));
	highwayJSONCalls.residential.push(readJSONData(data_dirs[d], "highways_residential.json"));
	highwayJSONCalls.service.push(readJSONData(data_dirs[d], "highways_service.json"));
	highwayJSONCalls.track.push(readJSONData(data_dirs[d], "highways_track.json"));
	highwayJSONCalls.path.push(readJSONData(data_dirs[d], "highways_path.json"));
	highwayJSONCalls.footway.push(readJSONData(data_dirs[d], "highways_footway.json"));
	highwayJSONCalls.road.push(readJSONData(data_dirs[d], "highways_road.json"));
    }
    
    $.when.apply($, highwayJSONCalls.primary).done(handleRoadStatisicsData("#primary_road_length_div", "#primary_road_count_div", '#F00', 4, null));
    $.when.apply($, highwayJSONCalls.secondary).done(handleRoadStatisicsData("#secondary_road_length_div", "#secondary_road_count_div", '#FFA500', 3, null));
    $.when.apply($, highwayJSONCalls.tertiary).done(handleRoadStatisicsData("#tertiary_road_length_div", "#tertiary_road_count_div", '#FFFF00', 3, null));
    $.when.apply($, highwayJSONCalls.unclassified).done(handleRoadStatisicsData("#un_road_length_div", "#un_road_count_div", '#000', 2, null));
    $.when.apply($, highwayJSONCalls.residential).done(handleRoadStatisicsData("#res_road_length_div", "#res_road_count_div", '#FFF', 2, null));
    $.when.apply($, highwayJSONCalls.service).done(handleRoadStatisicsData("#service_road_length_div", "#service_road_count_div", '#FFF', 2, null));
    $.when.apply($, highwayJSONCalls.track).done(handleRoadStatisicsData("#tracks_length_div", "#tracks_count_div", '#D27259', 2, "5 2"));
    $.when.apply($, highwayJSONCalls.path).done(handleRoadStatisicsData("#paths_length_div", "#paths_count_div", '#D29259', 2, "5 5"));
    $.when.apply($, highwayJSONCalls.footway).done(handleRoadStatisicsData("#footway_length_div", "#footway_count_div", '#D29200', 2, "3 5"));
    $.when.apply($, highwayJSONCalls.road).done(handleRoadStatisicsData("#highway_road_length_div", "#highway_road_count_div", '#FFA', 2, null));
}

function createResidentialAreaStatistics(data_dirs) {
    var ajaxCalls = [];
    
    for (var d = 0; d < data_dirs.length; d++) {
	ajaxCalls.push(readJSONData(data_dirs[d], "residential_areas.json"));
    }
    $.when.apply($, ajaxCalls).done(function() {
	console.log(arguments);
	var elements = null;
	if (arguments.length > 1 && arguments[1].constructor === Array) {
	    elements = arguments[0][0];
	    combineElements(elements, Array.from(arguments).slice(1));
	}
	else {
	    elements = arguments[0];
	}
	
	calculateResidentialAreaStatistics(elements);
    });
}

function createBuildingStatistics(data_dirs) {
    var ajaxCalls = [];
    
    for (var d = 0; d < data_dirs.length; d++) {
	ajaxCalls.push(readJSONData(data_dirs[d], "buildings.json"));
    }
    $.when.apply($, ajaxCalls).done(function() {
	//console.log(arguments);
	var elements = null;
	if (arguments.length > 1 && arguments[1].constructor === Array) {
	    elements = arguments[0][0];
	    combineElements(elements, Array.from(arguments).slice(1));
	}
	else {
	    elements = arguments[0];
	}
		   
	calculateBuildingStatistics(elements);
    });
}


function calculateBuildingStatistics(elements) {

    var buildingsCount = 0;
    var modifiedCount = 0;
    
    for (var i = 0; i < elements.length; i++) {
        var building = elements[i];

	if(building.version != 1) {
	    modifiedCount++;
	}
	else {
            var latLngs = [];
	    buildingsCount++;
            for (var j = 0; j < building.nodes.length; j++) {
		latLngs.push(L.latLng(building.nodes[j].lat, building.nodes[j].lon));
            }
            if (latLngs.length > 2) {
		var polygon = L.polygon(latLngs, {color: '#FF0000', weight: 2 });
		var linkText = 'Building, id: ' + building.id;
		//var linkText = '<a href="http://www.openstreetmap.org/way/' + building.id + '" target="_blank">View on openstreetmap.org</a>';
		polygon.bindPopup(linkText);
		polygon.addTo(map);
            }
	}
    }

    var modifiedPercentage = elements.length == 0 ? 0 : modifiedCount / elements.length * 100;
    var text = "" + buildingsCount + ", +" + modifiedCount + " modified" + " (" + modifiedPercentage.toFixed(1) + "%)";

    $("#building_count_div").text(text);
}

function calculateResidentialAreaStatistics(elements) {
    var residentialAreaCount = 0;
    var residentialAreaNonEmptyCount = 0;
    var totalArea = 0;
    var modifiedCount = 0;

    for (var i = 0; i < elements.length; i++) {
        var residentialArea = elements[i];

	if(residentialArea.version != 1) {
	    modifiedCount++;
	}
	else {	    
            var area = 0;
            var latLngs = [];
	    residentialAreaCount++;
            for (var j = 0; j < residentialArea.nodes.length; j++) {
		latLngs.push(L.latLng(residentialArea.nodes[j].lat, residentialArea.nodes[j].lon));
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
    }

    var modifiedPercentage = elements.length == 0 ? 0 : modifiedCount / elements.length * 100;
    var text = "" + residentialAreaCount + ", +" + modifiedCount + " modified" + " (" + modifiedPercentage.toFixed(1) + "%)";
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
    var waysCount = 0;
    var totalWayLength = 0;
    var modifiedCount = 0;
    
    for (var i = 0; i < elements.length; i++) {
	if(elements[i].version != 1) {
	    modifiedCount++;
	}
	else {
	    var wayDistance = 0;
	    var latLngs = [];
	    waysCount++;
	    for (var j = 0; j < elements[i].nodes.length; j++) {
		latLngs.push(L.latLng(elements[i].nodes[j].lat, elements[i].nodes[j].lon));
	    }
	    var polyLine = L.polyline(latLngs, {weight: weight, color: mapLineColor, dashArray: dashArray });
	    var wayTextSuffix = "";
	    var linkText = "";
	    if (elements[i].tags.highway != undefined) {
		if (elements[i].tags.highway != "track" && elements[i].tags.highway != "path"
		    && elements[i].tags.highway != "road" && elements[i].tags.highway != "footway") {
		    wayTextSuffix = " road";
		}
		linkText = elements[i].tags.highway + wayTextSuffix + ', id: ' + elements[i].id;
		//var linkText = '<a href="http://www.openstreetmap.org/way/' + elements[i].id + '" target="_blank">View on openstreetmap.org</a>';
	    }
	    else if (elements[i].tags.waterway != undefined) {
		linkText = elements[i].tags.waterway + wayTextSuffix + ', id: ' + elements[i].id;
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
    }
    
    var length = totalWayLength / 1000;
    var text = "" + length.toFixed(1) + " km";
    $(lengthHtmlElementID).text(text);
    //console.log(totalWayLength);
    
    var modifiedPercentage = elements.length == 0 ? 0 : modifiedCount / elements.length * 100;
    text = "" + waysCount + ", +" + modifiedCount + " modified (" + modifiedPercentage.toFixed(1) + "%)";
    $(countHtmlElementID).text(text);

    return { "length": totalWayLength, "createdCount": waysCount, "modifiedCount": modifiedCount };
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function readCoords(filePath, callback) {

    // read and go through the geojson
    
    $.getJSON(filePath, function (geojsonData) {
	//console.log(geojsonData);

	var allCoordData = [];
	
	for (var i = 0; i < geojsonData.features.length; i++) {
	    var coordData = [];
	    var data = geojsonData.features[i].geometry.coordinates[0];
	    for (var j = 0; j < data.length - 1; j++) {
		coordData.push([data[j][1], data[j][0]]);
	    }
	    allCoordData.push(coordData);
	}
	
	callback(allCoordData);
    });
}

function handleRoadStatisicsData(lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray) {
    return function(data, textStatus, jqXHR) {
	//console.log(arguments);
	var elements = null;
	if (arguments.length > 1 && arguments[1].constructor === Array) {
	    elements = arguments[0][0];
	    combineElements(elements, Array.from(arguments).slice(1));
	}
	else {
	    elements = arguments[0];
	}
	var result = calculateRoadStatistics(elements, lengthHtmlElementID, countHtmlElementID, mapLineColor, weight, dashArray);
	roadStats.lengthSum += result.length;
	roadStats.count += result.createdCount;
	roadStats.modifiedCount += result.modifiedCount;
	
	roadStats.whenApplyCountRemaining--;
	if (roadStats.whenApplyCountRemaining == 0) {
	    $("#roads_total_length_div").text("" + Math.round(roadStats.lengthSum / 1000) + " km");
	    var modifiedPercentage = roadStats.modifiedCount / (roadStats.modifiedCount + roadStats.count) * 100;
	    $("#roads_total_count_div").text("" + roadStats.count + ", +" + roadStats.modifiedCount + " modified (" + modifiedPercentage.toFixed(1) + "%)");
	}
    };
}

function readJSONData(data_dir, json_file_name) {
    return $.getJSON(data_dir + json_file_name);
}   

function combineElements(elements, elementArrays) {
    for (var d = 0; d < elementArrays.length; d++) {
	var elems = elementArrays[d][0];
	for (var i = 0; i < elems.length; i++) {
	    if(!isInElements(elems[i], elements)) {
		elements.push(elems[i]);
	    }
	}
    }
}

function isInElements(element, elements) {
    
    for (var i = 0; i < elements.length; i++) {
	if (elements[i].id == element.id) {
	    return true;
	}
    }

    return false;
}
