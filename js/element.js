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

function _guid() { var guid = 0; HTMLElement.prototype.guid = function() { return ++guid } }; _guid();

var _html;
function html() { return _html ? _html : (_html = document.getElementsByTagName('html')[0]) }

var _head;
function head() { return _head ? _head : (_head = document.getElementsByTagName('head')[0]) }

var _body;
function body() { return _body ? _body : (_body = document.getElementsByTagName('body')[0]) }

HTMLElement.prototype.add = function() {
	for (var i = 0; i < arguments.length; ++i) 
		typeof(arguments[i]) == "boolean" ||
		typeof(arguments[i]) == "number" ||
		typeof(arguments[i]) == "string" ?
			this.appendChild(document.createTextNode(arguments[i])) :		
			this.appendChild(arguments[i]); 
}

HTMLElement.prototype.except = function() {
	for (var i = 0; i < arguments.length; ++i) this.removeChild(arguments[i]); 
	return this 
}

HTMLElement.prototype.as = function(x) {
	this.className = x;
	return this;
}

HTMLElement.prototype.html = function(x) { this.innerHTML = x }

String.prototype.render = function(d) {
	var t = this;
	for (var k in d) if (d.hasOwnProperty(k)) {
		var re = new RegExp('{' + k + '}');
		t = t.replace(re,d[k]);
	} 
	return t 
}

HTMLElement.prototype.render = function(t,a) {
	this.html(a.map(function(d) { return t.render(d) }).join('')); 
	return this 
}

function _() { 
	var b = body();
	b.add.apply(b,arguments);
	return b 
}

"link title meta base style canvas form select option input textarea button label legend ul ol dl li div p h1 h2 h3 h4 h5 quote pre br font hr img script table tr tc th td iframe".split(' ').map(function(x) {
	HTMLElement.prototype[x] = window[x] = function() { 
		var d = document.createElement(x);
		d.id = '_' + d.guid();
		d.add.apply(d,arguments);
		if (this.can('appendChild')) this.appendChild(d);
		return d;
	}
});
