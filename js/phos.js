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
// Phos
//	This library simulates a very simple cross-platform computing system.  It effectively hides
//	the implementation of the browser interface from the higher level code.  You can think of it
//	as a Hardware Abstraction Layer for your web browser.  It provides Javascript objects which
//	represent the various hardware devices that you might want to use, as well as, network
//	resources.  It is designed around the concept of a simple object oriented statemachine.
//
////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Functions
document.onkeypress = function() { return false }; 			// Hack to break backspace
document.oncontextmenu = function(e) { return false };			// Hack to remove popup menu

var _doc = document;
var _root = window;
var _body = null;

function boot() {
	_body = document.getElementsByTagName('body')[0];
	Display.init();
	Keyboard.init();
	Mouse.init();
	Screen.init();
	Objects.init();
	App.run();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Objects object
var Objects = let({
	init: function() { 
		window.each(function(v,k) { if (v && v.can('init')) Objects[k] = v});
		this.init = false;
	}
});

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
	var data = this.toString();
	this.request(cb);
	this._request.open("POST",url,true);
	this._request.setRequestHeader('Content-Type','appliaction/x-www-from-urlencoded');
	this._request.send(data);
	return this;
}
Object.prototype.get = function(url,cb) {
	this.request(function(txt) { if (typeof(cb) == "function") cb(txt) });
	this._request.open("GET",url,true);
	this._request.send("");
	return this;
};
Object.prototype.download = function() {
	document.location.href = "data:application/json,".append(this.toString().encode());
	return this;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Box Object
var Box = let({
	x: 0, y: 0, w: 0, h: 0,
	init: function() { return this.clone() },
	on: function(o) {
		var x = o.x ? o.x : 0;
		var y = o.y ? o.y : 0;
		var w = o.w ? o.w : 0;
		var h = o.h ? o.h : 0;
		return !( x+w < this.x || x > (this.x + this.w) || y+h < this.y || y > this.y + this.h);
	},
	overlaps: function(excluding) {
		var $self = this;
		return App.widgets.any(function(x) { 
			return x.can('on') && x != $self && !excluding.has(x) && x.on($self) });
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
// Widget Object
var Widget = let(Box, {
	visible: true,
	draw: function() {},				// Override to draw
	tick: function() {},				// Override to update based on time
	init: function() { return this.clone().instance() },	// Override to initialize
	free: function() { return this.remove() },	// Override this method for custom code
	remove: function() {
		App.widgets.except(this);
		return this.hide();
	},
	instance: function() {
		App.widgets.push(this);
		return this;
	},	
	add : function(o) { 
		if (!this.children) return;
		this.children.push(o); 
		return o.parent = this;
	},
	container: function() { this.children = []; return this },
	show: function () { this.visible = true; return this },
	hide: function () { this.visible = false; return this },
	down: function(e) { if (this.on(e)) this.moving = e },
	up: function(e) { this.moving = false },
	move: function(e) { if (this.moving) this.to(e.x-this.moving.x,e.y-this.moving.y).moving = e },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Display Object
var Display = let(Widget, {
	canvas: null,
	scroll: function(e) { this.to(e.dx,e.dy) }, // Override this if you don't want the canvas to scroll
	draw: function() { Screen.background(0,0,0) }, // Override to change the background
	create: function() {
		this.canvas = $_('canvas');
		this.canvas.id = 'canvas';
		_body.style.margin = 0;
		_body.add(this.canvas);
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		return this;
	},
	init: function() {
		this.canvas = $('canvas');
		if (this.canvas) return this.at(0,0).by(this.canvas.width,this.canvas.height).instance();
		return this.at(0,0).by(window.innerWidth, window.innerHeight).create().instance();	
		
	},
	up: function(e) { this.moving = false },
	down: function(e) { if (!e.overlaps([Display])) this.moving = e },
	move: function(e) { if (this.moving) this.to(-(e.x-this.moving.x),-(e.y-this.moving.y)) },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Screen Object
var Screen = let(Box,{
	ctx: null,
	rad: 5,
	size: 16,
	family: 'Arial',
	colorizer: false,
	init: function() { this.ctx = Display.canvas.getContext('2d'); return this },
	as: function(w) { return this.at(w.x,w.y).by(w.w,w.h) },
	to: function(x,y) { return this.at(this.x+x,this.y+y) },
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
	radius: function(r) { this.rad = r; return this },
	lineWidth: function(w) { this.ctx.lineWidth = w; return this },
	font: function(f) {
		var x = f.split(' ');
		if (x[0]) this.size = Math.floor(x[0]);
		if (x[1]) this.family = x[1];
		this.ctx.font = this.size.toString().append('px ',this.family);
		return this;
	},
	stroke: function() { this.ctx.stroke(); return this },
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
	circle: function() {
		this.ctx.beginPath();
		this.ctx.arc(this.x,this.y,this.rad,0,Math.PI*2,true);
		this.ctx.closePath();
		this.ctx.fill();
		return this;
	},
	print: function (tx) {
		if (!_doc) return this;
		var xo = this.x;
		var xm = xo;
		var ym = this.y;
		var $self = this;
		var w = (""+ tx).split("\n");
		w.every(function(x,i) {
			var len = Math.floor($self.ctx.measureText(x).width);
			if ($self.x + len + $self.size/2 > xo + $self.w) {	// Line Wrap
				$self.x = xo;
				$self.y += Math.floor($self.size);
			}
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
		if (img.loaded) this.ctx.drawImage(img.data,0,0,img.w,img.h,this.x,this.y,this.w,this.h);
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
	clear: function() { this.ctx.clearRect(0,0,Display.w,Display.h); return this },
	background: function(r,g,b) { 
		Display.canvas.style.background = 'rgb('.append(r,',',g,',',b,')'); 
		return this },
	color: function(r,g,b) {
		this.ctx.strokeStyle = this.ctx.fillStyle = 'rgb('.append(r,',',g,',',b,')'); 
		return this;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Object
var Event = let(Box,{
	key: 0,
	init: function(e) {
		return Event.clone().copy({
			button: e.button,
			key: Keyboard.key(e.keyCode, e.type == 'keydown'),
			time: new Date(),
			dx: Math.floor(e.wheelDeltaX),
			dy: Math.floor(e.wheelDeltaY),
		}).at(e.clientX + Display.x - Display.canvas.offsetLeft,e.clientY + Display.y - Display.canvas.offsetTop);
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Device Object
var Device = let({
	dispatch: function(n,e) { 
		App.widgets.every(function(w,i) { try { if (w.can(n)) w[n](Event.init(e)) } catch(e) {} });
		return this;
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
		if (Keyboard.modmap.can(k)) return Keyboard.modmap[k](b);
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
		this.dispatch('tick',{}).dispatch('draw',{});
		this.timer = setTimeout("App.run()",this.delay);
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
		return this
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sound Object
var Sound = let(Resource,{
	init: function(name) { return this.clone().load('audio',name) },
	play: function() { this.data.play(); return this },
	pause: function() { this.data.pause(); return this },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Image Object
var Image = let(Widget,Resource, {
	init: function(name) { return this.clone().load('img',name).instance() },
	draw: function() { Screen.at(this.x,this.y).by(this.w,this.h).draw(this) },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Movie Object
var Movie = let(Widget,Resource,{ 
	div: $_('div'),
	attached: false,
	init: function(name) {
		var i = this.clone();
		i.load('video',name,function($self) {
			if ($self.attached) return;
			$self.attached = true;
			$self.div = $_('div');
			$self.data.autobuffer = true;
			$self.data.autoplay = false;
			$self.div.style.position = 'absolute';
			$self.div.style.display = "block";
			$self.div.style.zIndex = 2;
			$self.div.add($self.data);
			_body.add($self.div);
			$('canvas').style.zIndex = 1;
		});
		return i.instance();
	},
	draw: function() {
		this.div.style.display = this.visible ? "inline" : "none";
		this.div.style.width = this.w;
		this.div.style.height = this.h;
		this.clamp(0,0,Display.w,Display.h);
		this.div.style.top = this.y;
		this.div.style.left = this.x;
	},
	play: function() { 
		if (this.data.readyState != 4) return this;
		this.data.play(); 
		return this;
	},
	pause: function() { this.data.pause(); return this },
	free: function() { _body.removeChild(this.div); }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// End
