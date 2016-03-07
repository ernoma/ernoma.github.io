//
// These functions are useful when creating map textures but they are used only during the application development
//

var zoom = 9;
var minLat = 8.830;
var minLng = 0.210;
var maxLat = 10.270;
var maxLng = 1.466;

var tileNumbers = calculateTileNumbers(zoom, minLat, minLng, maxLat, maxLng);
console.log(tileNumbers);

var tilesBounds = calculateTilesBounds(tileNumbers, zoom);
console.log(tilesBounds);

var xCount = tileNumbers.maxXY.x - tileNumbers.minXY.x + 1;
var yCount = tileNumbers.minXY.y - tileNumbers.maxXY.y + 1;

for (var x = tileNumbers.minXY.x; x <= tileNumbers.maxXY.x; x++) {
    for (var y = tileNumbers.maxXY.y; y <= tileNumbers.minXY.y; y++) {
	var URL = 'https://b.tile.thunderforest.com/outdoors/' + zoom + '/' + x + '/' + y + '@2x.png';
	//var URL = 'http://tile.openstreetmap.org/' + zoom + '/' + x + '/' + y + '.png';
	console.log(URL);
    }
}

function calculateTileNumbers(zoom, minLat, minLng, maxLat, maxLng) {
    var xy = {
        minXY: calculateTileNumber(zoom, minLat, minLng),
        maxXY: calculateTileNumber(zoom, maxLat, maxLng)
    };

    return xy;
}

function calculateTileNumber(zoom, lat, lon) {

    var xy = {
        x: undefined,
        y: undefined,
    };

    var xtile = Math.floor((lon + 180) / 360 * (1<<zoom)) ;
    var ytile = Math.floor((1 - Math.log(Math.tan(toRad(lat)) + 1 / Math.cos(toRad(lat))) / Math.PI) / 2 * (1<<zoom));
    if (xtile < 0)
        xtile = 0;
    if (xtile >= (1<<zoom))
        xtile = ((1<<zoom)-1);
    if (ytile < 0)
        ytile = 0;
    if (ytile >= (1<<zoom))
        ytile = ((1<<zoom)-1);

    xy.x = xtile;
    xy.y = ytile;

    return xy;
}

function calculateTilesBounds(tileNumbers, zoomLevel) {
    var minX = tileNumbers.minXY.x < tileNumbers.maxXY.x ? tileNumbers.minXY.x : tileNumbers.maxXY.x;
    var maxX = tileNumbers.minXY.x > tileNumbers.maxXY.x ? tileNumbers.minXY.x : tileNumbers.maxXY.x;
    var minY = tileNumbers.minXY.y < tileNumbers.maxXY.y ? tileNumbers.minXY.y : tileNumbers.maxXY.y;
    var maxY = tileNumbers.minXY.y > tileNumbers.maxXY.y ? tileNumbers.minXY.y : tileNumbers.maxXY.y;

    console.log("minX, maxX, minY, maxY:", minX, maxX, minY, maxY);

    var unit = 1.0 / (1 << zoomLevel);

    //
    // calculate sw
    //
    var sw_bounds = calculateTileBounds(minX, maxY, zoomLevel);
    //
    // calculate ne
    //
    var ne_bounds = calculateTileBounds(maxX, minY, zoomLevel);

    var bounds = {
        sw: {
            lat: sw_bounds.minY,
            lng: sw_bounds.minX
        },
        ne: {
            lat: ne_bounds.maxY,
            lng: ne_bounds.maxX
        }
    }
    return bounds;
}

function calculateTileBounds(tileX, tileY, zoom) {
    var bounds = {
        minY: tile2lat(tileY + 1, zoom),
        maxY: tile2lat(tileY, zoom),
        minX: tile2lon(tileX, zoom),
        maxX: tile2lon(tileX + 1, zoom)
    }

    return bounds;
}

function tile2lon(x, zoom) {
    return x / Math.pow(2.0, zoom) * 360.0 - 180;
}

function tile2lat(y, zoom) {
    var n = Math.PI - (2.0 * Math.PI * y) / Math.pow(2.0, zoom);
    return toDeg(Math.atan(sinh(n)));
}

function toDeg(rad) {
    return rad / (Math.PI / 180);
}

function toRad(degrees){
    return degrees * Math.PI / 180;
}

function sinh (arg) {
  return (Math.exp(arg) - Math.exp(-arg)) / 2;
}
