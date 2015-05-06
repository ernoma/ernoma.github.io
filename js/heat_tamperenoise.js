
var INITIAL_LAT = 61.5;
var INITIAL_LON = 23.766667;

var mmlTaustaLayer1 = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    maxZoom: 17
});
var mmlTaustaLayer2 = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    maxZoom: 17
});
var mmlTaustaLayer3 = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    maxZoom: 17
});
var mmlTaustaLayer4 = L.tileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg', {
    maxZoom: 17
});


$(document).ready(function(){

    var tilesURL = 'data/tre_noise_2012_day/{z}/{x}/{y}.png';
    var noiseLayerDay2012 = L.tileLayer(tilesURL, {
        minZoom: 10,
        maxZoom: 17
    });
    tilesURL = 'data/tre_noise_2012_night/{z}/{x}/{y}.png';
    var noiseLayerNight2012 = L.tileLayer(tilesURL, { 
	minZoom: 10,
	maxZoom: 17
    });
    tilesURL = 'data/tre_noise_2030_day/{z}/{x}/{y}.png';
    var noiseLayerDay2030 = L.tileLayer(tilesURL, {
        minZoom: 10,
        maxZoom: 17
    });
    tilesURL = 'data/tre_noise_2030_night/{z}/{x}/{y}.png';
    var noiseLayerNight2030 = L.tileLayer(tilesURL, {
        minZoom: 10,
        maxZoom: 17,
	attribution: '<br>Sisältää Maanmittauslaitoksen taustakartta-aineistoa, \
<a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501", \
TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a> |<br>\
Meluselvitys, Tampereen kaupunki, <a href="http://www.tampere.fi/avoindata/lisenssi">lisenssi</a>'
    });

	
/*    var noiseLayerNight2012 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
	layers: 'opendata:YV_MELU_Y_2012_KESKIAANI',
	format: 'image/png',
	transparent: true
    });
    var noiseLayerDay2012 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
        layers: 'opendata:YV_MELU_P_2012_KESKIAANI',
        format: 'image/png',
        transparent: true
    });

    var noiseLayerNight2030 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
        layers: 'opendata:YV_MELU_Y_2030_KESKIAANI',
        format: 'image/png',
        transparent: true,
        attribution: '<br>Sisältää Maanmittauslaitoksen taustakartta-aineistoa, \
<a href="http://www.maanmittauslaitos.fi/avoindata_lisenssi_versio1_20120501", \
TMS: <a href="http://kartat.kapsi.fi/">kartat.kapsi.fi</a> |<br>\
Meluselvitys, Tampereen kaupunki, <a href="http://www.tampere.fi/avoindata/lisenssi">lisenssi</a>'
    });
    var noiseLayerDay2030 = L.tileLayer.wms('http://opendata.navici.com/tampere/opendata/ows', {
        layers: 'opendata:YV_MELU_P_2030_KESKIAANI',
        format: 'image/png',
        transparent: true
    });
    */
    var mapDay2012 = L.map('div1', {
	layers: [mmlTaustaLayer1, noiseLayerDay2012],
	attributionControl: false,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);
    var mapNight2012 = L.map('div2', {
	layers: [mmlTaustaLayer2, noiseLayerNight2012],
        attributionControl: false,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);
    var mapDay2030 = L.map('div3', {
	layers: [mmlTaustaLayer3, noiseLayerDay2030],
        attributionControl: false,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);
    var mapNight2030 = L.map('div4', {
	layers: [mmlTaustaLayer4, noiseLayerNight2030],
        attributionControl: true,
        zoomControl: false
    }).setView([INITIAL_LAT, INITIAL_LON], 12);

    mapNight2012.addControl(L.control.zoom( { position: 'topright' } ));
    
    L.Control.setOpacityControlMap(mapNight2012);
    var higherOpacity = new L.Control.higherOpacity();
    mapNight2012.addControl(higherOpacity);
    //var opacitySlider = new L.Control.opacitySlider();
    //mapNight2012.addControl(opacitySlider);
    var lowerOpacity = new L.Control.lowerOpacity();
    mapNight2012.addControl(lowerOpacity);
    //higherOpacity.setOpacityLayer(noiseLayerNight2012);
    higherOpacity.addOpacityLayer(noiseLayerDay2012);
    higherOpacity.addOpacityLayer(noiseLayerNight2012);
    higherOpacity.addOpacityLayer(noiseLayerDay2030);
    higherOpacity.addOpacityLayer(noiseLayerNight2030);

    mapDay2012.sync(mapNight2012);
    mapDay2012.sync(mapDay2030);
    mapDay2012.sync(mapNight2030);

    mapNight2012.sync(mapDay2012);
    mapNight2012.sync(mapDay2030);
    mapNight2012.sync(mapNight2030);

    mapDay2030.sync(mapDay2012);
    mapDay2030.sync(mapNight2012);
    mapDay2030.sync(mapNight2030);
    
    mapNight2030.sync(mapDay2012);
    mapNight2030.sync(mapNight2012);
    mapNight2030.sync(mapDay2030);

    var infoNight2012 = L.control( { position: 'topleft' } );
    infoNight2012.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
	this.update();
	return this._div;
    }
    infoNight2012.update = function (text) {
	this._div.innerHTML = (text ? text : '');
    };
    var infoDay2012 = L.control( { position: 'topleft' } );
    infoDay2012.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
        this.update();
        return this._div;
    }
    infoDay2012.update = function (text) {
        this._div.innerHTML = (text ? text : '');
    };
    var infoDay2030 = L.control( { position: 'topleft' } );
    infoDay2030.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
        this.update();
        return this._div;
    }
    infoDay2030.update = function (text) {
        this._div.innerHTML = (text ? text : '');
    };
    var infoNight2030 = L.control( { position: 'topleft' } );
    infoNight2030.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'feature_info'); // create a div with a class "info"
        this.update();
        return this._div;
    }
    infoNight2030.update = function (text) {
        this._div.innerHTML = (text ? text : '');
    };

    infoNight2012.addTo(mapNight2012);
    infoNight2012.update('Melu 2012, yöllä');
    infoDay2012.addTo(mapDay2012);
    infoDay2012.update('Melu 2012, päivällä');
    infoDay2030.addTo(mapDay2030);
    infoDay2030.update('Melu 2030, päivällä');
    infoNight2030.addTo(mapNight2030);
    infoNight2030.update('Melu 2030, yöllä');
});
