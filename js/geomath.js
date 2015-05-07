
var wgs84Proj4 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
var etrsgk24Proj4 = '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs';

function is_inside_circle(latlng, circle) {

	var lat1 = latlng.lat;
	var lat2 = circle.getLatLng().lat;
	var lng1 = latlng.lng;
	var lng2 = circle.getLatLng().lng;

	var dist = getDistanceFromLatLonInMeters(lat1, lng1, lat2, lng2);
	
	//console.log(dist);
	//console.log(circle.getRadius());
	
	return dist <= circle.getRadius();
}

function is_inside_rectangle(latlng, rectangle) {
	return rectangle.getBounds().contains(latlng);
}

//
// Edited from http://stackoverflow.com/questions/4287780/detecting-whether-a-gps-coordinate-falls-within-a-polygon-on-a-map
//
function is_inside_polygon(latlng, polygon)
{       
    var angle = 0;
    var point1_lat;
    var point1_long;
    var point2_lat;
    var point2_long;
    var n = polygon.length;

    for (var i = 0; i < n; i++) {
        point1_lat = polygon[i].lat - latlng.lat;
        point1_long = polygon[i].lng - latlng.lng;
        point2_lat = polygon[(i + 1) % n].lat - latlng.lat; 
        point2_long = polygon[(i + 1) % n].lng - latlng.lng;
        angle += angle2D(point1_lat, point1_long, point2_lat, point2_long);
    }
    
    if (Math.abs(angle) < Math.PI) {
        return false;
    }
    
    return true;
}
    
function angle2D(y1, x1, y2, x2) {
    var dtheta;
    var theta1;
    var theta2;

    theta1 = Math.atan2(y1, x1);
    theta2 = Math.atan2(y2, x2);
    dtheta = theta2 - theta1;
    while (dtheta > Math.PI) {
	dtheta -= Math.PI * 2;
    }
    while (dtheta < Math.PI) {
	dtheta += Math.PI * 2;
    }

    return dtheta;
}


function addMetersToLat(latLng, meters) {
	var latLngInETRS = proj4(wgs84Proj4, etrsgk24Proj4, [latLng.lng, latLng.lat]);
	var newLatInETRS = latLngInETRS[1] + meters;
	var latLngInWGS84 = proj4(etrsgk24Proj4, wgs84Proj4, [latLngInETRS[0], newLatInETRS]);
	return latLngInWGS84[1];
}

function addMetersToLng(latLng, meters) {
	var latLngInETRS = proj4(wgs84Proj4, etrsgk24Proj4, [latLng.lng, latLng.lat]);
	var newLngInETRS = latLngInETRS[0] + meters;
	var latLngInWGS84 = proj4(etrsgk24Proj4, wgs84Proj4, [newLngInETRS, latLngInETRS[1]]);
	return latLngInWGS84[0];
}

function subtractMetersFromLat(latLng, meters) {
	var latLngInETRS = proj4(wgs84Proj4, etrsgk24Proj4, [latLng.lng, latLng.lat]);
	var newLatInETRS = latLngInETRS[1] - meters;
	var latLngInWGS84 = proj4(etrsgk24Proj4, wgs84Proj4, [latLngInETRS[0], newLatInETRS]);
	return latLngInWGS84[1];
}

function subtractMetersFromLng(latLng, meters) {
	var latLngInETRS = proj4(wgs84Proj4, etrsgk24Proj4, [latLng.lng, latLng.lat]);
	var newLngInETRS = latLngInETRS[0] - meters;
	var latLngInWGS84 = proj4(etrsgk24Proj4, wgs84Proj4, [newLngInETRS, latLngInETRS[1]]);
	return latLngInWGS84[0];
}

//
// Distance constant from http://gis.stackexchange.com/questions/19760/how-do-i-calculate-the-bounding-box-for-given-a-distance-and-latitude-longitude
//
function getlatLngBounds(latLng, latRadiusInMeters, lngRadiusInMeters) {
	// console.log("latRadiusInMeters: " + latRadiusInMeters);
	// console.log("lngRadiusInMeters: " + lngRadiusInMeters);
	
	var latLngInETRS = proj4(wgs84Proj4, etrsgk24Proj4, [latLng.lng, latLng.lat]);
	// console.log("latLngInETRS: " + latLngInETRS);
	
	var minLatInETRS = latLngInETRS[1] - latRadiusInMeters;
	var maxLatInETRS = latLngInETRS[1] + latRadiusInMeters;
	var minLngInETRS = latLngInETRS[0] - lngRadiusInMeters;
	var maxLngInETRS = latLngInETRS[0] + lngRadiusInMeters;
	// console.log("minLatInETRS: " + minLatInETRS);
	// console.log("maxLatInETRS: " + maxLatInETRS);
	// console.log("minLngInETRS: " + minLngInETRS);
	// console.log("maxLngInETRS: " + maxLngInETRS);
	
	var minLatLngInWGS84 = proj4(etrsgk24Proj4, wgs84Proj4, [minLngInETRS, minLatInETRS]);
	var maxLatLngInWGS84 = proj4(etrsgk24Proj4, wgs84Proj4, [maxLngInETRS, maxLatInETRS]);
	// console.log("minLatLngInWGS84: " + minLatLngInWGS84);
	// console.log("maxLatLngInWGS84: " + maxLatLngInWGS84);

	var minLat = minLatLngInWGS84[1];
	var maxLat = maxLatLngInWGS84[1];
	var minLng = minLatLngInWGS84[0];
	var maxLng = maxLatLngInWGS84[0];
	// console.log("minLat: " + minLat);
	// console.log("maxLat: " + maxLat);
	// console.log("minLng: " + minLng);
	// console.log("maxLng: " + maxLng);
	
	//console.log("dist lat: " + getDistanceFromLatLonInMeters(minLat, minLng, maxLat, minLng));
	//console.log("dist lng: " + getDistanceFromLatLonInMeters(minLat, minLng, minLat, maxLng));
	
	return L.latLngBounds(L.latLng(minLat, minLng), L.latLng(maxLat, maxLng));
}

//
// From http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
//
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  var R = 6371*1000; // Radius of the earth in m
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance inm
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// $c = false; 

// $vertices_x = array(22.333,22.222,22,444);  //latitude points of polygon
// $vertices_y = array(75.111,75.2222,76.233);   //longitude points of polygon
// $points_polygon = count($vertices_x); 
// $longitude =  23.345; //latitude of point to be checked
// $latitude =  75.123; //longitude of point to be checked

// if (is_in_polygon($points_polygon, $vertices_x, $vertices_y, $longitude, $latitude)){
    // echo "Is in polygon!"."<br>";
// }
// else { 
    // echo "Is not in polygon"; 
// }

// function is_in_polygon($points_polygon, $vertices_x, $vertices_y, $longitude_x, $latitude_y) {
    // $i = $j = $c = 0;

    // for ($i = 0, $j = $points_polygon-1; $i < $points_polygon; $j = $i++) {
        // if (($vertices_y[$i] >  $latitude_y != ($vertices_y[$j] > $latitude_y)) && ($longitude_x < ($vertices_x[$j] - $vertices_x[$i]) * ($latitude_y - $vertices_y[$i]) / ($vertices_y[$j] - $vertices_y[$i]) + $vertices_x[$i])) {
            // $c = !$c;
        // }
    // }

    // return $c;
// }
