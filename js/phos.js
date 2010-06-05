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
var _doc = document;
var _root = window;
var _body = null;
var here;		// the last mouse position
var that;		// the last thing selected
var editing;		// the block we're editing
var clipboard;		// the last object we cut or copied

////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Functions
_doc.onkeypress = function() { return false }; 			// Hack to break backspace
_doc.oncontextmenu = function(e) { return false };			// Hack to remove popup menu
_root.onresize = function() { _doc.location.href = _doc.location.href };

function nop() {}

_root.onload = function() {
	_body = _doc.getElementsByTagName('body')[0];
	use('Box','Widget','Component','Event','Device','Resource',
		'Display','Keyboard','Mouse','Screen',
		'Text','Sound','Image','Movie',
		'Help','Names','HotKey','Block','Inventory',
		'Objects','Phosphor','Graphic','Rectangle','Circle',
		'Blog','Search','App');
	navigator.userAgent.match(/Chrome/) ? use('Chrome') :
	navigator.userAgent.match(/Safari/) ? use('Safari') :
	navigator.userAgent.match(/Firefox/) ? use('Firefox') :
		alert('Unsupported Browser');
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// End
