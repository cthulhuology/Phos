// element.js
//
// Adhoc extension of DOM HTMLElements
//
// © 2010 David J. Goehrig
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

HTMLElement.prototype.except = function() {
	for (var i = 0; i < arguments.length; ++i) this.removeChild(arguments[i]);
	return this;
}

text = function(x) { return document.createTextNode(x); }
HTMLElement.prototype.html = function(x) { this.innerHTML = x; }
HTMLElement.prototype.render = function(t,a) {
	var $self = this;
	$self.html(a.map(function(d) {
		var tt = t;
		for (var k in d) if (d.hasOwnProperty(k)) {
			var re = new RegExp('{' + k + '}');
			 tt = tt.replace(re,d[k]);
		}
		return tt;
	}).join(''));
	return this;
}

// HTML HTMLElements
function _guid() {
	var guid = 0;
	HTMLElement.prototype.guid = function() { return ++guid; }
}; _guid();

function html() { return document.getElementsByTagName('html')[0]; }
function head() { return document.getElementsByTagName('head')[0]; }
function body() { return document.getElementsByTagName('body')[0]; }
function _() { 
	var b = body();
	for(var i = 0; i < arguments.length; ++i) 
		b.appendChild(typeof(arguments[i]) == "string" ? text(arguments[i]) : arguments[i]);
}

"link title meta base style form select option input textarea button label legend ul ol dl li div p h1 h2 h3 h4 h5 quote pre br font hr img script table tr tc th td iframe".split(' ').map(function(x) {
	HTMLElement.prototype[x] = window[x] = function() { 
		var d = document.createElement(x);
		d.id = '_' + d.guid() 
		for (var i = 0; i < arguments.length; ++i) 
			d.appendChild(typeof(arguments[i]) == "string" ? text(arguments[i]) : arguments[i]);
		if (this.can('appendChild')) this.appendChild(d);
		return d;
	}
});
