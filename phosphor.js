// phosphor.js
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
// Object Extensions
Object.prototype.property = function(c,k,x,y) {
	var t = Text.init(this + "").at(x,y).by(200,20);
	t.childof = c;
	t.valueof = k;
	return [ t ];
}
Object.prototype.display = function(x,y) {
	var a = [];
	var $self = this;
	this.each(function(v,k) {
		if (!k) return;
		var t = Text.init(k).at(x,y).by(200,20);
		t.childof = $self;
		y += Screen.size*1.5;
		a.push(t);
	});
	return a;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Array Extensions
Array.prototype.collapse = function() { 
	this.every(function(o,i) { 
		if (o.expanded) o.expanded.collapse();
		o.free();
	})
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Text Object
var Text = let(Widget,{
	bg: "gray",
	moving: false,
	editing: false,
	expanded: false,
	init: function(txt) { 
		var t = Text.clone();
		t.content = txt 
		return t.instance();
	},
	evaluate: function() {
		var retval = ""
		try { retval = eval("(" + this.content + ")") } catch(e) { alert(e); return "" };
		return "" + retval;
	},
	press: function(e) {
		if (!this.editing) return;
		this.content =  e.key == Keyboard.enter && this.childof && this.valueof ? 
			this.childof[this.valueof] = this.content: 
			e.key == Keyboard.enter ? this.evaluate():
			e.key == Keyboard.backspace ? 
			this.content.length == 0 || Keyboard.shift ? this.free() :
			this.content.substring(0,this.content.length-1):
			this.content + e.key;
	},
	draw: function() {
		if (!this.visible) return;
		Screen[this.editing ? 'white' : 'gray']();
		Screen.at(this.x,this.y+Screen.size).by(this.w-Screen.size,this.h).font('16 Arial').print(this.content);
		this.by(Math.max(this.w,(Screen.x+Display.x)-this.x + Screen.size),(Screen.y+Display.y)-this.y + Screen.size/2);
		Screen.at(this.x-Screen.size/2,this.y).by(this.w,this.h).frame();
	},
	down: function(e) { 
		if (this.hit(e)) {
			this.moving = e 
			if (e.button == 2 && _root[this.content]) {
				this.expanded = this.expanded ? 
					this.expanded.collapse():
					_root[this.content].display(this.x,this.y+this.h);
			}
			if (e.button == 2 && this.childof) {
				this.expanded = this.expanded ?
					this.expanded.collapse():
					this.childof[this.content].property(this.childof,this.content,this.x+this.w,this.y);
			}
		}
	},
	up: function(e) {  this.moving = false },
	move: function(e) { 
		this.editing = this.hit(e);
		if (this.moving) {
			this.to(e.x - this.moving.x,e.y -this.moving.y );
			this.moving = e;
		}
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Phosphor Environment
var Phosphor = let(Widget,{
	init: function() {
		// Display.scroll = null;
		this.at(0,Display.h-64).by(Display.w,64);
		return this.instance();
	},
	draw: function() {
		if (!this.visible) return;
	},
	move: function(e) { },
	down: function(e) {
		if (App.widgets.any(function(o) {
			if ( !o.can('hit') || o == Phosphor || o == Display) return false;
			return o.hit(e);
		})) return;
		if (e.button == 2) { // Right Click to add a text block
			var t = Text.init('');
			t.at(e.x,e.y).by(100,24);
		}
	},
});
////////////////////////////////////////////////////////////////////////////////////////////////////
// End
