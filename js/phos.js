////////////////////////////////////////////////////////////////////////////////////////////////////
// phos.js
//
// Copyright (C) 2009,2010 David J. Goehrig
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
// Phos
//	This library simulates a very simple cross-platform computing system.  It effectively hides
//	the implementation of the browser interface from the higher level code.  You can think of it
//	as a Hardware Abstraction Layer for your web browser.  It provides Javascript objects which
//	represent the various hardware devices that you might want to use, as well as, network
//	resources.  It is designed around the concept of a simple object oriented statemachine.
//

function $(x) { return document.getElementById(x) }
function $_(x) { return document.createElement(x) }
document.goto = function(x) { document.location.href = x }

var _doc = document;
var _root = window;
var _body = null;
var here;		// the last mouse position
var that;		// the last thing selected
var these;		// the targets of a selection
var editing;		// the block we're editing
var clipboard;		// the last object we cut or copied

var A;
var An = A = {
	object: function() { return a({}) },
	string: function() { return '' },
	array: function() { return [] },
};


////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Functions
_doc.onkeypress = function() { return false }; 			// Hack to break backspace
_doc.oncontextmenu = function(e) { return false };			// Hack to remove popup menu
_root.onresize = function() { _doc.location.href = _doc.location.href };

function nop() {}

// Object Prototype Extensions necessary for bootstrapping
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

Object.prototype.get = function(url,cb) { return this.request("GET",url,cb) }

Object.prototype.use = function() {
	var modules = [];
	modules.push.apply(modules,arguments);
	var module = modules.shift();
	var url = '/object/' + module;
	var cb = function(txt) {
		if (!txt) return;
		try { 
			eval('( function () { ' + txt + ' } )')(); 
		} catch(e) { 
			console.error('Load error: ' + e + ':' + txt); ;
		}
		if (modules.length) {
			var module = modules.shift();
			var url = '/object/' + module;
			if (module) this.get(url,cb);
		}
	};
	return this.get(url,cb) 
}
	
_root.onload = function() {
	_body = _doc.getElementsByTagName('body')[0];
	use('Object','Array','String','Box','Widget','Component','Event','Device','Resource',
		'Display','Keyboard','Mouse','Screen','Text','Sound','Image','Movie',
		'Help','Inventory','Trash','Objects','Mirror','Phosphor',
		'Names','HotKey','Block',
		'Graphic','Rectangle','Circle','Daimond',
		'Blog','Search','App', 
		navigator.userAgent.match(/AppleWebKit\/534/) ? 'Safari' :
		navigator.userAgent.match(/Safari/) ? 'Safari' :
		navigator.userAgent.match(/Chrome/) ? 'Chrome' :
		navigator.userAgent.match(/Firefox/) ? 'Firefox' : 
		'Opera');
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// End
