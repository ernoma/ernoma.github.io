L.Icon.Text = L.Icon.extend({
	initialize: function (text, options) {
		this._text = text;
		L.Icon.prototype.initialize.apply(this, [options]);
	},

	createIcon: function() {
	    this._divel = document.createElement('div');
	    this._span = document.createElement('span');
	    //this._span.style.display = 'block';
	    this._textNode = document.createTextNode(this._text);
	    this._span.appendChild(this._textNode);
	    this._divel.appendChild(this._span);
	    this._setIconStyles(this._divel, 'icon');
	    //this._divel.style.verticalAlign = "top";
	    //this._divel.style.display = "inline-block";
	    this._divel.style.marginTop = "-40px";
	    this._divel.style.textAlign = "center";
	    this._divel.style.color = '#2222ff';
		//el.style.textShadow = '2px 2px 2px #fff';
	    return this._divel;
	},

    
    changeText: function (text) {
	this._text = text;
	newTextNode = document.createTextNode(this._text);
	this._span.replaceChild(newTextNode, this._textNode);
	this._textNode = newTextNode;	
    },

	createShadow: function() { return null; }

});

L.Marker.Text = L.Marker.extend({
    changeText: function (text) {
	this._fakeicon.changeText(text.charAt(0) == '_' ? text.substring(1, text.length): text);
    },

    initialize: function (latlng, text, options) {
        L.Marker.prototype.initialize.apply(this, [latlng, options]);
	this._fakeicon = new L.Icon.Text(text);
	//this._fakeicon = L.divIcon(options);
    },

    _initIcon: function() {
        L.Marker.prototype._initIcon.apply(this);
	
	var i = this._icon, s = this._shadow, origIcon = this.options.icon;
	this._icon = this._shadow = null;
	
	this.options.icon = this._fakeicon;
        L.Marker.prototype._initIcon.apply(this);
	this.options.icon = origIcon;
	
	if (s) {
	    s.parentNode.removeChild(s);
	    this._icon.appendChild(s);
	}
	
	i.parentNode.removeChild(i);
	//this._icon.insertBefore(i, this._icon.firstChild); // append the image icon to the fakeicon div
	this._icon.appendChild(i);

	/*var w = this._icon.clientWidth, h = this._icon.clientHeight;
	  this._icon.style.marginLeft = -w / 2 + 'px';
	  //this._icon.style.backgroundColor = "red";
	  var off = new L.Point(w/2, 0);
	  if (L.Browser.webkit) off.y = -h;
	  L.DomUtil.setPosition(i, off);
	  if (s) L.DomUtil.setPosition(s, off);*/
    }
});
