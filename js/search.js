
function okffiGeocoding(text, callOnResponse) {
    
    console.log(text);

    if (text.length < 3) {
	callOnResponse([]);
	} else {
	    $.getJSON('http://api.okf.fi/gis/1/autocomplete.json?address=' + encodeURI(text) + '&language=fin', function(response) {
		
		var descriptions = [];
		
		for( var i = 0; i < response.predictions.length; i++) {
		    for (var j = 0; j < response.predictions[i].address_components.length; j++) {
			if (response.predictions[i].address_components[j].types[0] == 'administrative_area_level_3') {
			    if (response.predictions[i].address_components[j].long_name == 'Tampere') {
				descriptions.push(response.predictions[i].description.replace(/, /g, ',').replace(/ /g, '+'));
				}
			    break;
			    }
			}
		    }
		
		var expectedResponseCount = descriptions.length;
		var responses = [];
		
		if (expectedResponseCount > 0) {
		    for( var i = 0; i < descriptions.length; i++) {
			$.getJSON('http://api.okf.fi/gis/1/geocode.json?address=' + encodeURI(descriptions[i]) + '&lat=&lng=&language=fin', function(response) {
			    //console.log(response);
			    responses.push(response);
			    if (responses.length == expectedResponseCount) {
				callOnResponse(responses);
				}
			    });
			}
		    }
		else {
		    callOnResponse([]);
		    }
		});
	    }
}

function filterGeocodingResult(rawJson) {

    //console.log(rawJson);

    var json = {},
    key, loc, disp = [];

    for(var i = 0; i < rawJson.length; i++) {
	if (rawJson[i].status == "OK") {
	    for (var j = 0; j < rawJson[i].results.length; j++) {
		for (var k = 0; k < rawJson[i].results[j].address_components.length; k++) {
		    if (rawJson[i].results[j].address_components[k].types[0] == 'administrative_area_level_3') {
			if (rawJson[i].results[j].address_components[k].long_name == 'Tampere') {
			    key = rawJson[i].results[j].formatted_address;
			    loc = L.latLng( rawJson[i].results[j].geometry.location.lat, rawJson[i].results[j].geometry.location.lng );
			    json[ key ] = loc;//key,value format
			    }
			break;
			}
		    }
		}
	    }
	}

    return json;
}
