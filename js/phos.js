////////////////////////////////////////////////////////////////////////////////////////////////////
// phos.js
//
// Copyright (C) 2009 David J. Goehrig
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
var _doc = document;
var _root = window;
var _body = null;
function boot() {
	_body = document.getElementsByTagName('body')[0];
	Display.init();
	Keyboard.init();
	Mouse.init();
	Screen.init();
	App.run();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// DOM Functions
function $(x) { return _doc.getElementById(x) }
function $_(x) { return _doc.createElement(x) }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Array Functions
Array.prototype.every = function (f) { for (var i  = 0; i < this.length; ++i) f(this[i],i); }
Array.prototype.last = function() { return this[this.length -1 ]; }
Array.prototype.expunge = function (e) {
	for (var i = 0; i < this.length; ++i) if (this[i] == e) this.splice(i,1);	
}
Array.prototype.map = function (f) {
	var retval = [];
	this.every(function(x) { retval.push(f(x)) });
	return retval;
}
Array.prototype.reduce = function (f,o) {
	var retval = o;	
	this.every(function(x) { retval = f(retval,x) });
	return retval;
}
Array.prototype.has = function(a) {
	for (var i = 0; i < this.length; ++i) 
		if (this[i] == a) return true;
	return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Object Functions
Object.prototype.each = function(f) {
	for (var k in this) 
		if (this.hasOwnProperty(k) && k.charAt(0) != "_" && k != 'prototype') f(this[k],k);
}
Object.prototype.let = function(n) {
	var o = {};
	for (var i = 0; i < arguments.length; ++i) arguments[i].each(function(v,k) { o[k] = v });
	return o;
}
Object.prototype.walk = function(f) {
	for (var d = this; d; d = d.sibling) f(d);
}
Object.prototype.slots = function() {
	var i = 0;
	for (var k in this) if (this.hasOwnProperty(k) && k.charAt(0) != "_" && k != 'prototype') ++i;
	return i;
}
Object.prototype.any = function(t) {
	for (var k in this) if (t(this[k],k)) return this[k];
	return null;
}
Object.prototype.can = function(k) {
	if (typeof(this[k]) == "function") return true;
	return false;
}
Object.prototype.isa = function(x) {
	var retval = true;
	var $self = this;
	x.each(function(v,k) { if (x.can(k) && !$self.can(k)) return retval = false });
	return retval;
}
Object.prototype.clone = function() {
	var Proto = function () {};
	Proto.prototype = this;
	var retval =  new Proto();
	return retval;
}
Object.prototype.debug = function() {
	var out = "";
	this.each(function(v,k) { out += k + "=" +  v });
	alert(out);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// JSON Functions
function toJson(o,seen) {
	if (!seen) seen = [];
	seen = seen.push(o);
	var formatter = {
		'boolean' : function(x,l) { return x ? "true" : "false" },
		'function' : function(x,l) { return '"' + x.toString().replace(/"/g,'\\"') + '"' },
		'object' : function (x,l) {
			if (x == null) return "null";
			if (typeof(x.indexOf) == 'function') return "[ "+(x.map(toJson).join(', '))+" ]";
			var retval = [];
			for (var i in x) if (x.hasOwnProperty(i)) 
				retval.push('"'+i+'": '+(l.has(x[i])? "null":toJson(x[i],l.push(x[i]))));
			return '{ ' + retval.join(', ') + ' }';
		},
		'number' : function (x,l) { return '' + x },
		'string' : function (x,l) { return '"' + x + '"' }
	}
	return (formatter[typeof(o)]) ? formatter[typeof(o)](o,seen) : "";
}
Object.prototype.json = function() { return toJson(this); }
Object.prototype.unjson = function() {
	var tmp = eval(this.toString());
	for (var i in tmp) 
		if (tmp.hasOwnProperty(i) && /^(function)/.exec(tmp[i])) tmp[i] = eval(tmp[i]);
	return tmp;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML Functions
Element.prototype.add = function(e) {
	this.appendChild(e);
	return this;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Functions
Object.prototype.listen = 
Element.prototype.listen = function(e,f) {
	this.addEventListener(e,f,false);
	return this;
}
document.onkeypress = function() { return false }; 			// Hack to break backspace
document.onmousedown = function(e) { e.preventDefault(); return false } // Hack to manage buttons
document.oncontextmenu = function(e) { return false };			// Hack to remove popup menu

////////////////////////////////////////////////////////////////////////////////////////////////////
// Network Functions
Object.prototype.request = function(cb) {
	this._request = XMLHttpRequest ? new XMLHttpRequest(): _doc.createRequest();
	this._request.onreadystatechange = function () {
		if (this.readyState != 4 || typeof(cb) != "function") return;
		if (this.status == 404) cb(null);
		if (this.status == 200) cb(this.responseText);
	};
	return this._request;
}
Object.prototype.post = function(url,cb) {
	var data = (typeof(this) == "string" ) ? this : this.json();
	this.request(cb);
	this._request.open("POST",url,true);
	this._request.setRequestHeader('Content-Type','appliaction/x-www-from-urlencoded');
	this._request.send(data);
}
Object.prototype.get = function(url,cb) {
	this.request(function(txt) { if (typeof(cb) == "function") cb(txt) });
	this._request.open("GET",url,true);
	this._request.send("");
};
Object.prototype.download = function() {
	document.location.href = "data:application/json," + escape(this.json());
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// String Functions
String.prototype.last = function() { return this.substring(this.length-1) }
String.prototype.decode = function() { return unescape(this).replace(/\+/g," ") }
String.prototype.path = function () { return this.substr(0,1+this.lastIndexOf('/')) }
String.prototype.hostname = function () { return this.substr(7,this.indexOf('/',7) - 7) }
String.prototype.clean = function() { return this; }
String.prototype.content = function() { return this; }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Box Object
var Box = let({
	x: 0, y: 0, w: 0, h: 0,
	init: function() { return this.clone() },
	hit: function(o) {
		var x = o.x ? o.x : 0;
		var y = o.y ? o.y : 0;
		var w = o.w ? o.w : 0;
		var h = o.h ? o.h : 0;
		return !( x+w < this.x ||
			x > (this.x + this.w) ||
			y+h < this.y ||
			y > this.y + this.h);
	},
	at: function(x,y) {
		this.x = Math.floor(x);
		this.y = Math.floor(y);
		return this;
	},
	to: function(x,y) {
		this.x += Math.floor(x);
		this.y += Math.floor(y);
		return this;
	},
	by: function(w,h) {
		this.w = Math.floor(w);
		this.h = Math.floor(h);
		return this;
	},
	scale: function(w,h) {
		this.w += w;
		this.h += h;
		return this;
	},
	as: function(b) { return this.at(b.x,b.y).by(b.w,b.h) },
	clamp: function(x,y,w,h) {
		this.x = Math.max(x,this.x);
		this.y = Math.max(y,this.y);
		this.x = Math.min(w - this.w,this.x);
		this.y = Math.min(h - this.h,this.y);
		return this;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Object
var Resource = let(Box,{
	loaded: false,
	init: function() { return Resource.clone() },
	load: function(t,i,cb) {
		var $self = this;
		$self.data = $_(t);
		$self.data.onload = function () {
			$self.loaded = true;
			($self.data.videoWidth) ? 
				$self.by($self.data.videoWidth,$self.data.videoHeight):
				$self.by($self.data.width,$self.data.height);
			if (typeof(cb)=="function") cb($self);
		}
		$self.data.src = i;	
		if ($self.data.can('load')) $self.data.load();
		return $self;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Widget Object
var Widget = let(Box, {
	visible: true,
	draw: function() {},				// Override to draw
	tick: function() {},				// Override to update based on time
	init: function() { return this.clone() },	// Override to initialize
	free: function() { return this.remove() },	// Override this method for custom code
	remove: function() {
		var $self = this;
		this.hide();
		App.widgets.expunge(this);
		return this;
	},
	instance: function() {
		App.widgets.push(this);
		return this;
	},	
	show: function () { this.visible = true; return this },
	hide: function () { this.visible = false; return this },
	overlaps: function(excluding) {
		var $self = this;
		return App.widgets.any(function(x) { 
			return x.can('hit') && x != $self && !excluding.has(x) && x.hit($self) });
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Display Object
var Display = let(Widget, {
	canvas: null,
	init: function() {
		if ($('canvas')) {
			this.canvas = $('canvas');
			return this.at(0,0).by($('canvas').width,$('canvas').height).instance();
		}
		this.at(0,0).by(window.innerWidth-16, window.innerHeight-16);	
		this.canvas = $_('canvas');
		this.canvas.id = 'canvas';
		_body.add(this.canvas);
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		return this.instance();
	},
	scroll: function(e) { this.to(e.w,e.h) }, // Override this if you don't want the canvas to scroll
	draw: function() { Screen.background(0,0,0) }, // Override to change the background
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Screen Object
var Screen = let(Box,{
	ctx: null,
	rad: 5,
	size: 16,
	family: 'Arial',
	colorizer: false,
	init: function() {
		this.ctx = Display.canvas.getContext('2d');
		return this;
	},
	as: function(w) {
		this.at(w.x,w.y);
		return this.by(w.w,w.h);
	},
	to: function(x,y) {
		return this.at(this.x+x,this.y+y);
	},
	at: function(x,y) {
		this.x = x - Display.x;
		this.y = y - Display.y;
		this.ctx.moveTo(this.x,this.y);
		return this;
	},
	by: function(w,h) {
		this.w = w;
		this.h = h;
		return this;
	},
	radius: function(r) {
		this.rad = r;
		return this;
	},
	lineWidth: function(w) {
		this.ctx.lineWidth = w;
		return this;
	},
	font: function(f) {
		var x = f.split(" ");
		if (x[0]) this.size = Math.floor(x[0]);
		if (x[1]) this.family = x[1];
		this.ctx.font = this.size + "px " + this.family;
		return this;
	},
	colorize: function(x) {
		this.colorizer = x;
		return this;
	},
	stroke: function() {
		this.ctx.stroke();
		return this;
	},
	line: function() {
		this.ctx.lineTo(this.x+this.w,this.y+this.h);
		this.ctx.stroke();
		return this;
	},
	frame: function() {
		this.ctx.beginPath();
		this.ctx.moveTo(this.x+this.rad,this.y);
		this.ctx.lineTo(this.x+this.w-2*this.rad,this.y);
		this.ctx.arcTo(this.x+this.w,this.y,this.x+this.w,this.y+this.rad,this.rad);
		this.ctx.lineTo(this.x+this.w,this.y+this.h-2*this.rad);
		this.ctx.arcTo(this.x+this.w,this.y+this.h,this.x+this.w-this.rad,this.y+this.h,this.rad);
		this.ctx.lineTo(this.x+this.rad,this.y+this.h);
		this.ctx.arcTo(this.x,this.y+this.h,this.x,this.y+this.h-this.rad,this.rad);
		this.ctx.lineTo(this.x,this.y+this.rad);
		this.ctx.arcTo(this.x,this.y,this.x+this.rad,this.y,this.rad);
		this.ctx.stroke();
		this.ctx.closePath();
		this.to(this.w,this.h);
		return this;
	},
	print: function (tx) {
		if (!_doc) return this;
		var xo = this.x;
		var xm = xo;
		var ym = this.y;
		var $self = this;
		var a = (""+ tx).split(" ");
		a.every(function(x,i) {
			var len = Math.floor($self.hack ? $self.ctx.mozMeasureText(x).width: 
					$self.ctx.measureText(x).width);
			if ($self.x + len + $self.size/2 > xo + $self.w) {	// Line Wrap
				$self.x = xo;
				$self.y += Math.floor($self.size);
			}
			$self.hack ? $self.ctx.mozDrawText(x): 
				$self.ctx.fillText(x,$self.x,$self.y);
			$self.x += len + Math.floor($self.size/2.0);	// Text + Space 
			xm = Math.max(xm,$self.x);
			ym = Math.max(ym,$self.y);
		});
		$self.x = xm;
		$self.y = ym;
		return this;
	},
	draw: function (img) {
		if (! img.loaded) return this;
		this.ctx.drawImage(img.data,0,0,img.w,img.h,this.x,this.y,this.w,this.h);
		return this;
	},
	red: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "red"; return this },
	yellow: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "yellow"; return this },
	green: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "green"; return this },
	blue: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "blue"; return this },
	orange: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "orange"; return this },
	purple: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "purple" ; return this},
	black: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "black"; return this },
	gray: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "gray"; return this },
	white: function() { this.ctx.fillStyle = this.ctx.strokeStyle = "white"; return this },
	fill: function() {
		this.ctx.beginPath();
		this.ctx.rect(this.x,this.y,this.w,this.h);
		this.ctx.fill();
		this.ctx.closePath();
		return this;
	},
	rect: function() {
		this.ctx.rect(this.x,this.y,this.w,this.h);
		this.ctx.stroke();
		return this;
	},
	clear: function() {
		this.ctx.clearRect(0,0,Display.w,Display.h);
		return this;
	},
	background: function(r,g,b) {
		Display.canvas.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
		return this;
	},
	color: function(r,g,b) {
		this.ctx.strokeStyle = this.ctx.fillStyle =  "rgb(" + r + "," + g + "," + b + ")";
		return this;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Object
var Event = let(Box,{
	key: 0,
	init: function(e) {
		var ev = Event.clone();
		ev.button = e.button;
		ev.key = Keyboard.key(e.keyCode, e.type == 'keydown');
		ev.at(e.clientX + Display.x - Display.canvas.offsetLeft,e.clientY + Display.y - Display.canvas.offsetTop);
		ev.by(Math.floor(e.wheelDeltaX),Math.floor(e.wheelDeltaY));
		ev.time = new Date();
		return ev;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Device Object
var Device = let({
	dispatch: function(n,e) { 
		App.widgets.every(function(w,i) { if (w.can(n)) w[n](Event.init(e)) });
	}, 
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Keyboard Object
var Keyboard = let(Device, {
	backspace: -8,
	enter: -13,
	shift: false,
	ctrl: false,
	alt: false,
	cmd: false,
	lcmd: false,
	rcmd: false,
	press:  function(e) { Keyboard.dispatch('press',e)  },
	reset: function(e) { if (Keyboard.modmap[e.keyCode]) Keyboard.modmap[e.keyCode](false) },
	init: function() {
		_root.listen('keyup',Keyboard.reset).listen('keydown',Keyboard.press);
		return this;
	},
	modmap: { 
		16: function (b) { Keyboard.shift = b; return '' }, 
		17: function (b) { Keyboard.ctrl = b; return '' }, 
		18: function (b) { Keyboard.alt = b; return '' }, 
		91: function (b) { 
			Keyboard.lcmd = b; 
			Keyboard.cmd = Keyboard.lcmd || Keyboard.rcmd; 
			return '' },
		93: function (b) { 
			Keyboard.rcmd = b; 
			Keyboard.cmd = Keyboard.lcmd || Keyboard.rcmd; 
			return '' },
		37: function (b) { Keyboard.left = b; return '' },
		38: function (b) { Keyboard.up = b; return '' },
		39: function (b) { Keyboard.right = b; return '' },
		40: function (b) { Keyboard.down = b; return '' },
	},
	key: function(k,b) {
		if (typeof(Keyboard.modmap[k]) == 'function') return Keyboard.modmap[k](b);
		return typeof(Keyboard.keymap[k]) == 'string' ? Keyboard.keymap[k].charAt(Keyboard.shift ? 1 : 0): typeof(Keyboard.keymap[k]) == 'number' ? Keyboard.keymap[k] : '';
	},
	keymap: {
		192: '`~', 49: '1!', 50: '2@', 51: '3#', 52: '4$', 53: '5%', 54: '6^', 55: '7&', 56: '8*', 57 : '9(', 48: '0)',  189: '-_', 187: '=+',
		9: '\t\t', 81: 'qQ', 87: 'wW', 69: 'eE', 82: 'rR', '84' : 'tT', 89: 'yY', 85: 'uU', 73: 'iI', 79: 'oO', 80: 'pP', 219: '[{', 221: ']}', 220: '\\|',
		65: 'aA', 83: 'sS', 68: 'dD', 70: 'fF', 71: 'gG', 72: 'hH', 74: 'jJ', 75: 'kK', 76: 'lL', 186: ';:', 222: '\'"', 13 : -13,
		16: '', 90: 'zZ', 88: 'xX', 67: 'cC', 86: 'vV', 66: 'bB', 78: 'nN', 77: 'mM', 188: ',<', 190:'.>', 191: '/?',
		17: '', 18: '',	91:'', 32: '  ', 93: '', 37: '', 38: '', 39: '', 40: '', 8: -8, 10: -10,
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Mouse Object
var Mouse = let(Device, {
	over: function(e) { Mouse.dispatch('over',e) },
	move: function(e) { Mouse.dispatch('move',e) },
	down: function(e) { Mouse.dispatch('down',e) },
	up: function(e) { Mouse.dispatch('up',e) },
	scroll: function(e) { Mouse.dispatch('scroll',e) },
	init: function () { 
		_root.listen('mouseover',Mouse.over).listen('mousemove',Mouse.move).listen('mousedown',Mouse.down).listen('mouseup',Mouse.up).listen('mousewheel',Mouse.scroll).listen('onscroll',Mouse.scroll);
		return this;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// App Object
var App = let(Device, {
	delay: 40,
	widgets: [],
	run: function () { 
		Screen.clear();
		this.dispatch('tick',{});
		this.dispatch('draw',{});
		this.timer = setTimeout("App.run()",this.delay);
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// End
