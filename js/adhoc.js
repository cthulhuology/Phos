// adhoc.js
//
// © 2009,2010 David J. Goehrig
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
////////////////////////////////////////////////////////////////////////////////////////////////////
// Adhoc Javascript
//
// 	This library of extensions turns Javascript into a real Object Oriented Functional Language.
//	Within the following functions are routines that serve as an alternative to traditional flow
//	control structures, utilities to ease string and arry concatenatination. An object cloning, 
//	replication, and component model.  A property based object clasification system, and better
//	support for object introspection.  Also support for componetized collective objects allow 
//	for multiple message dispatch.  Finally, it also a few small DOM manipulations functions.
//
////////////////////////////////////////////////////////////////////////////////////////////////////
// Syntax Helpers

var A;
var An = A = {
	object: function() { return a({}) },
	string: function() { return '' },
	array: function() { return [] },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// String prototype extensions

String.prototype.last = function() { return this.substring(this.length-1) }
String.prototype.first = function() { return this.substring(0,1) }
String.prototype.decode = function() { return unescape(this) }
String.prototype.encode = function() { return escape(this) }
String.prototype.append = function() {
	var retval = this;
	for (var i = 0; i < arguments.length; ++i) retval += arguments[i].toString();
	return retval 
}
String.prototype.contains = function(s) { return 0 <= this.indexOf(s) }
String.prototype.name = function() { return this }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Object prototype extensions

Object.prototype.a = Object.prototype.an = function(x,v) { return x.can('init') ? x.init(v): x.clone() };
Object.prototype.the = function(x) { return x };

Object.prototype.clone = function() {
	var Proto = function() {};
	Proto.prototype = this;
	return new Proto() 
}

Object.prototype.copy = function(o) {
	var $self = this;
	o.each(function(v,k) { $self[k] = v });
	return this 
}

Object.prototype.does = function(v,f) { this[v] = f; return this }

Object.prototype.from = function() {
	this['init'] = function() { return this };
	for (var i = 0; i < arguments.length; ++i) this.copy(arguments[i]);
	return this 
}

Object.prototype.has = function(v,k) {
	this[k.last() == "*" ? k : k.append('*')] = v;
	return this 
}

Object.prototype.contains = function(e) {
	var retval = false;
	this.each(function(v,k) { if (k == e) return retval = true });
	return retval 
}

Object.prototype.each = function(f) {
	for (var k in this) if (this.hasOwnProperty(k) && k != 'prototype') f(this[k],k);
	return this 
}

Object.prototype.all = function(f) {
	for (var k in this) if (k != 'prototype') f(this[k],k);
	return this 
}

Object.prototype.which = function(f) {
	var w = [];
	this.each(function(v,k) { if (f(v,k)) w.push(v) });
	return w 
}

Object.prototype.parts = function() { return this.which(function(v,k) { return k.last() == "*" }) }

Object.prototype.can = function(k) { return (typeof(this[k]) == "function") }

Object.prototype.slots = function() {
	var i = 0;
	this.each(function(v,k) { if (k && v) ++i });
	return i 
}

Object.prototype.its = function(k) { return k.last() != '*' ? this[k.append('*')] : this[k] }

Object.prototype.of = function(x,k) { 
	var args = [ arguments[1], arguments[2], arguments[3], arguments[4], arguments[5] ];
	var $s = this;
	x.parts().every(function(p,i) { if (p.is($s) && p.can(k)) p[k](args[1],args[2],args[3],args[4])});
	return this 
}

Object.prototype.names = function() {
	var retval = [];
	var $self = this;
	window.each(function(v,k) { if (v === $self) retval.push(k) });
	return retval 
}

Object.prototype.name = function() { return this.names()[0] }
Object.prototype.plural = function(x) { return window[x] = this }

Object.prototype.named =  function(x) {
	var lc = x.name().toLowerCase();
	var $self = this;
	An[lc]= function(y) { return a($self,y) };
	return window[x.name()] = this 
}

Object.prototype.is = function(x) {
	var $self = this;
	var retval = true;
	x.all(function(v,k) { if (x.can(k) && !$self.can(k)) return retval = false });
	return retval 
}

Object.prototype.implements = function() {
	var $self = this;
	var retval = [];
	Objects.each(function(v,k) { if ($self.is(v)) retval.push(k) });
	return retval 
}

Object.prototype.any = function(f) {
	var retval = null;
	this.each(function(v,k) { if (f(v,k)) return retval = v });
	return retval 
}

Object.prototype.module = function() {
	var ots = Object.prototype.toString;
	Object.prototype.toString = function() {
		var retval = '{ ';
		this.each(function(v,k) { 
			if (typeof(v) == 'function') retval = retval.append(k,': ',v,', '); 
			if (typeof(v) == 'string') retval = retval.append(k,': "', v, '", ');
			if (typeof(v) == 'number') retval = retval.append(k,': ', v, ', ');
			if (typeof(v) == 'boolean') retval = retval.append(k,': ', v, ', ');
			if (typeof(v) == 'object') retval = retval.append(k, ': ', v.name(), ', ');
		});
		return retval.append('}') };
	var retval = this.toString();
	Object.prototype.toString = ots;
	return retval 
}

Object.prototype.use = function() {
	var urls = [];
	for (var i = 0; i < arguments.length; ++i) urls[i] = arguments[i];
	var url = urls.shift();
	var cb = function(txt) {
		if (!txt) alert('Failed to load '.append(url));
		try { 
			eval('('.append(txt,')')) 
			var url = urls.shift();
			if (url) get(url,cb);
		} catch(e) { alert('Load error: '.append(e,':',txt)) }
	};
	return this.get(url,cb) 
}
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Network Functions
Object.prototype.request = function(method,url,cb,data) {
	var _request = XMLHttpRequest ? new XMLHttpRequest(): _doc.createRequest();
	_request.onreadystatechange = function () {
		if (this.readyState != 4 || typeof(cb) != "function") return;
		if (this.status == 404) cb(null);
		if (this.status == 200) cb(this.responseText);
	};
	_request.open(method,url,true);
	_request.setRequestHeader('Content-Type','application/x-www-from-urlencoded');
	_request.send(data ? data : '');
	return this;
}
Object.prototype.post = function(url,cb) { return this.request("POST",url,this.toString(),cb) }
Object.prototype.get = function(url,cb) { return this.request("GET",url,cb) }

Object.prototype.download = function() {
	document.goto("data:application/json,".append(this.toString().encode()));
	return this;
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// Array extensions
Array.prototype.every = function(f) {
	for (var i = 0; i < this.length; ++i) f(this[i],i);
	return this;
}

Array.prototype.map = function(f) {
	var retval = [];
	this.every(function(x,i) { retval.push(f(x)) });
	return retval;
}

Array.prototype.apply = function(f,o) {
	var retval = o;
	this.every(function(x,i) { retval = f(retval,x) });
	return retval;
}
	
Array.prototype.contains = function(e) {
	var retval = false;
	this.every(function(x,i) { if (x == e) return retval = true });
	return retval;
}

Array.prototype.append = function(a) {
	var $self = this;
	a.every(function(x,i) { $self.push(x) });
	return this;
}

Array.prototype.and = function() {
	for (var i = 0; i < arguments.length; ++i) this.push(arguments[i]);
	return this;
}

Array.prototype.except = function (e) { 
	for (var i = 0; i < this.length; ++i) if (this[i] == e) this.splice(i,1);	
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML Element Extensions

Object.prototype.listen = HTMLElement.prototype.listen = function(e,f) {
	this.addEventListener(e,f,false);
	return this;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// DOM Functions
function $(x) { return document.getElementById(x) }
function $_(x) { return document.createElement(x) }
document.goto = function(x) { document.location.href = x }

