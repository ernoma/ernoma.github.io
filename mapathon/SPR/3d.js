//
// Three.js basic objects
//
var scene = undefined;
var camera = undefined;
var renderer = undefined;

//
// For viewing nice photo behind the map
//
var backgroundScene = undefined;
var backgroundCamera = undefined;

//
// Show fps (or other) info to help application development
//
var stats = undefined;

//
// For user to navigate around the scene
//
var controls = undefined;

//
// Size of the map
//
var terrainWidth = 768;
var terrainHeight = 768;
//
// Parameters for the THREE.Plane map. These should be small when no specific
// reason to be large like when terrain height map is used.
//
var origTerrainWidth = 18;
var origTerrainHeight = 20;

//
// For projecting lng,lat coordinates to the coordinates of the map plan shown on the screen
//
var projection = undefined;

//
// The map plane shown for the user
//
var map = undefined;

//
// These arrays are used for storing meshes to help for iterating over them in various occasions
//
var allObjects = [];

$(document).ready( function() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, $('#webgl').innerWidth() / $('#webgl').innerHeight(), 0.1, 10000 );
    camera.position.set(0, 400, 300);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    //console.log($('#webgl').innerWidth());
    //console.log($('#webgl').innerHeight());
    renderer.setSize( $('#webgl').innerWidth(), $('#webgl').innerHeight());
    renderer.setClearColor(new THREE.Color(0xaaaaff, 1.0));
    document.getElementById('webgl').appendChild( renderer.domElement );

    controls = new THREE.TrackballControls(camera, renderer.domElement);

    //projection = d3.geo.mercator()
	//.translate([(terrainWidth) / 2, (terrainHeight) / 2])
	//.scale(1)
	//.rotate([0, 0, 0])
	//.center([0.8, 9.5]); // mercator: 8734817,5 - x, 2646699;

    //var axes = new THREE.AxisHelper(200);
    //scene.add(axes);

    addLights();
  
    setupBackground();
}); // $(document).ready

/*******************************************************************************
 * Setup functionality
 ******************************************************************************/

//
// Show a nice photo behind the map
//
function setupBackground() {
    var texture = THREE.ImageUtils.loadTexture( 'background-1157111_960_720.jpg', undefined, function() {
	showMap();
    });
    texture.minFilter = THREE.LinearFilter;
    var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 0),
        new THREE.MeshBasicMaterial({
	    map: texture
        }));

    backgroundMesh.material.depthTest = false;
    backgroundMesh.material.depthWrite = false;

    backgroundScene = new THREE.Scene();
    backgroundCamera = new THREE.Camera();
    backgroundScene.add(backgroundCamera);
    backgroundScene.add(backgroundMesh);
}

//
// Construct the map UI, starting with the map plane
//
function showMap() {

    var URL = '9.jpg';

    var texture = THREE.ImageUtils.loadTexture(URL, undefined, function () {
    });
    texture.minFilter = THREE.LinearFilter;
    //console.log(texture);
    var geometry = new THREE.PlaneGeometry(terrainWidth, terrainHeight, origTerrainWidth - 1, origTerrainHeight - 1);
    var material = new THREE.MeshPhongMaterial({
	map: texture,
	side: THREE.DoubleSide
    });
    
    var ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;

    map = ground;
    scene.add(map);

    showExternalData();

    //
    // Ready to show the scene for the user
    //
    render();
}    
//
// Without lights nothing is shown in the scene
//
function addLights() {
    scene.add(new THREE.AmbientLight(0xbbbbbb));
    
    //
    // For nice introduction to Three.JS see the book "Learning Three.js: The JavaScript 3D Library for WebGL - Second Edition", https://www.packtpub.com/web-development/learning-threejs-javascript-3d-library-webgl-second-edition" by Jos Dirksen
    //
    var spotLightFlare = new THREE.SpotLight(0xffffff);
    spotLightFlare.position.set(120, 610, -3000);
    spotLightFlare.castShadow = false;
    spotLightFlare.intensity = 0.5;
    scene.add(spotLightFlare);

/*    var textureFlare0 = THREE.ImageUtils.loadTexture("/images/lensflare/lensflare0.png");
    var textureFlare3 = THREE.ImageUtils.loadTexture("/images/lensflare/lensflare3.png");

    var flareColor = new THREE.Color(0xffaacc);
    var lensFlare = new THREE.LensFlare(textureFlare0, 200, 0.0, THREE.AdditiveBlending, flareColor);

    lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);
    
    lensFlare.position.copy(spotLightFlare.position);
    scene.add(lensFlare);*/

    //$("#light_info").text('Laitetaan valot päälle... valmis.');
}

//
// Get and show the traffic light data from the external server via its API
//
function showExternalData() {
    
    d3.csv("coords.csv", function (data) {
	//console.log(data);
	
	var coords = [];

	var latSum = 0;
	var lngSum = 0;

	for (var i = 0; i < data.length; i++) {
	    latSum += Number(data[i].lat);
            lngSum += Number(data[i].lon);
	    //coords.push(projection([data[i].lng, data[i].lat]));
	}

	var centerLat = latSum / data.length;
        var centerLng = lngSum / data.length;

	var shape = drawShape(data);

	console.log(shape);

	var lineMesh = new THREE.Line(shape.createPointsGeometry(10), new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 }));

	makeTransforms(lineMesh);
	//makeInitialTransformations(lineMesh, projection([centerLng, centerLat]));
	scene.add(lineMesh);

	console.log(lineMesh);

	camera.lookAt(lineMesh.position);
    });

    showPriorityAreas();

    $.getJSON("landuse_residential.json", function (data) {
	calculateResidentialAreaStatistics(data.elements, 0xfffc00);
    });

    //$.getJSON("buildings.json", function (data) {
    //    calculateResidentialAreaStatistics(data.elements, 0xff0000);
    //});

    $.getJSON("highways_unclassified.json", function (data) {
	//console.log(data);
	calculateRoadStatistics(data.elements, "#res_road_length_div", '#000000', 2);
    });

    $.getJSON("highways_residential.json", function (data) {
        //console.log(data);
        calculateRoadStatistics(data.elements, "#res_road_length_div", '#FFFFFF', 4);
    });

    $.getJSON("highways_track.json", function (data) {
        //console.log(data);
        calculateRoadStatistics(data.elements, "#res_road_length_div", '#E7D4A0', 3);
    });

    $.getJSON("highways_path.json", function (data) {
        //console.log(data);
        calculateRoadStatistics(data.elements, "#res_road_length_div", '#9F7E45', 4);
    });
}

function calculateResidentialAreaStatistics(elements, color) {
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
                    latLngs.push([residentialAreaNodes[k].lat, residentialAreaNodes[k].lon]);
                    break;
                }
            }
        }
        if (latLngs.length > 2) {
            residentialAreaNonEmptyCount++;

	    var shape = new THREE.Shape();
	    shape.moveTo(latLngs[0][1], latLngs[0][0]);

	    for (var j = 1; j < latLngs.length - 1; j++) {
		shape.lineTo(latLngs[j+1][1], latLngs[j+1][0]);
	    }
	    shape.lineTo(latLngs[0][1], latLngs[0][0]);

	    var shapeGeom = new THREE.ShapeGeometry(shape);
	    var mesh = new THREE.Mesh(shapeGeom, new THREE.MeshBasicMaterial({color: color, wireframe: false}));

	    //var lineMesh = new THREE.Line(shape.createPointsGeometry(2), new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 }));
            makeTransforms(mesh);
            //makeInitialTransformations(lineMesh, projection([centerLng, centerLat]));
            scene.add(mesh);

            //var polygon = L.polygon(latLngs, {color: '#FFFF00', weight: 2 });
            //var linkText = 'Residental area, id: ' + residentialArea.id;
            //var linkText = '<a href="http://www.openstreetmap.org/way/' + residentialArea.id + '" target="_blank">View on openstreetmap.org</a>';
            //polygon.bindPopup(linkText);
            //polygon.addTo(map);
            //area = L.GeometryUtil.geodesicArea(latLngs); // in squaremeters
            //totalArea += area;
        }
    }

    //$("#res_area_count_div").text(residentialAreaNonEmptyCount);
    //$("#res_area_total_area_div").html(Math.round(totalArea) + " m<sup>2</sup>");
    //$("#res_area_avg_area_div").html(Math.round(totalArea / residentialAreaNonEmptyCount) + " m<sup>2</sup>");
}



function showPriorityAreas() {
    var priority_areas = [[[0.806121826171875, 9.352867708269317], [0.729217529296875, 9.325765958926807], [0.7196044921874999, 9.233604298380849], [0.7525634765625, 9.17124596242516], [0.81573486328125, 9.197003998984497], [0.863800048828125, 9.25529157227662], [0.84320068359375, 9.329831355689189], [0.806121826171875, 9.352867708269317]], [[0.736083984375, 9.43957908942936], [0.79376220703125, 9.385387020096225], [0.8802795410156249, 9.393516371824855], [0.888519287109375, 9.499180522706919], [0.789642333984375, 9.55606312481075], [0.720977783203125, 9.501889432784711], [0.736083984375, 9.43957908942936]], [[0.6207275390625, 9.768611091236496], [0.534210205078125, 9.725300127953927], [0.52459716796875, 9.634599651357629], [0.591888427734375, 9.557417356841308], [0.718231201171875, 9.60074993224686], [0.736083984375, 9.722593006167342], [0.6207275390625, 9.768611091236496]]];

    for (var i = 0; i < priority_areas.length; i++) {
	var lines = new THREE.Geometry();
	for (var j = 0; j < priority_areas[i].length; j++) {
            lines.vertices.push(new THREE.Vector3( priority_areas[i][j][0], priority_areas[i][j][1], 0));
 	}
        var lineMesh = new THREE.Line(lines, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 }));
        //console.log(lineMesh);
        makeTransforms(lineMesh);
        lineMesh.position.y += 0.2;
        scene.add(lineMesh);
    }
}


/*******************************************************************************
 * Helper functionality
 ******************************************************************************/

function drawShape(coords) {
    var shape = new THREE.Shape();

    for (var i = 0; i < coords.length - 1; i++) {
	shape.moveTo(coords[i].lon, coords[i].lat);
	shape.lineTo(coords[i+1].lon, coords[i+1].lat);
    }
    return shape;
}

function translate(point) {
  return [point[0] - (terrainWidth / 2), point[1] - (terrainHeight / 2)];
}

function makeTransforms(mesh) {
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.set(368, 368, 368);
    mesh.position.set(-386, 0.2, 3475);
}


function makeInitialTransformations(mesh, coord) {

    var x = coord[0];
    x = Math.round(x / terrainWidth * origTerrainWidth);
    var y = coord[1];
    y = Math.round(y / terrainHeight * origTerrainHeight);
    coord = translate(coord);

    //console.log(coord);

    mesh.position.set(coord[1], 0, coord[0]);
    mesh.rotation.x = -Math.PI / 2;
}

//
// Necessary function for showing and updating the Three.js scene
//
function render() {
    //stats.update();

    controls.update();
    requestAnimationFrame(render);
    
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene , backgroundCamera );
    renderer.render(scene, camera);
}

//
// Useful info during the application development
//
function initStats() {
    var stats = new Stats();
    
    stats.setMode(0);  // 0: fps, 1: ms
    
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    
    document.getElementById("Stats-output").appendChild(stats.domElement);
    
    return stats;
}

//
// When user resizes the browser window resize the scene accordingly
//
$( window ).resize(function() {
    camera.aspect = $('#webgl').innerWidth() / $('#webgl').innerHeight();
    camera.updateProjectionMatrix();
    renderer.setSize($('#webgl').innerWidth(), $('#webgl').innerHeight());
});

//
// This event is also used just for debugging purposes, to show which object(s) user clicked on the scene
//
function onClick(event) {

    //console.log(event);

    if (event.which == 1) {

	var mouse = new THREE.Vector2((event.clientX / renderer.domElement.width ) * 2 - 1, -( (event.clientY) / renderer.domElement.height ) * 2 + 1);
	
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects(allObjects, true);

	for (var i = 0; i < intersects.length; i++) {
            console.log(intersects[0]);
	    //console.log(intersects[0].object.venue.name);

            //intersects[i].object.material.transparent = true;
            //intersects[i].object.material.opacity = 0.1;
	}
    }
}

$( window ).click(onClick);

//
// Show information of the objects in the scene when user moves mouse cursor around the scene
//
$( window ).mousemove(function(event) {
     var mouse = new THREE.Vector2((event.clientX / renderer.domElement.width ) * 2 - 1, -( (event.clientY) / renderer.domElement.height ) * 2 + 1);

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );
    
    var intersects = raycaster.intersectObjects(allObjects, true);
    
    var allInfo = [];

    for (var i = 0; i < intersects.length; i++) {
	//console.log(intersects[i].object.info);
	
	var object = intersects[i].object;
	
	while (object.info == undefined && object.parent != null) {
	    object = object.parent;
	}
	var exists = false;
	for (var j = 0; j < allInfo.length; j++) {
	    if (allInfo[j] == object.info) {
		exists = true;
		break;
	    }
	}
	if (!exists) {
	    allInfo.push(object.info);
	}
    }

    //showInfo(allInfo);

});

function showInfo(allInfo) {

    //console.log(allInfo);

    //
    // Show info of the object(s) to the user
    //

    if (allInfo.length == 0) {
        $("#object_info").css("visibility", "hidden");
    }
    else {
        var content = "";

        for (var i = 0; i < allInfo.length; i++) {
            content += '<div class="object_info_content">' + allInfo[i][0] + '</div>';
        }

        $("#object_info").empty();
        $("#object_info").append('<div id="object_info_contents">' + content + '</div>');
        $("#object_info").css("visibility", "visible");
    }
}


function calculateRoadStatistics(elements, htmlElementID, mapLineColor, lineWidth) {
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
                    latLngs.push(highwayNodes[k]);
                    break;
                }
            }
        }
	
	//console.log(latLngs.length);

	if (latLngs.length > 1 && highWay.id != 367398810) {    
	    var lines = new THREE.Geometry();
	    for (var a = 0; a < latLngs.length; a++) {
		lines.vertices.push(new THREE.Vector3(latLngs[a].lon, latLngs[a].lat, 0));
	    }
	    var lineMesh = new THREE.Line(lines, new THREE.LineBasicMaterial({ color: mapLineColor, linewidth: lineWidth }));
	    //console.log(lineMesh);
	    makeTransforms(lineMesh);
	    lineMesh.position.y += 0.5;
	    scene.add(lineMesh);
	}

        /*if (highWay.id != 26239440) {
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
        }*/

    }

    //$(htmlElementID).text("" + Math.round(totalRoadLength / 1000) + " km");
    //console.log(totalRoadLength);
}
