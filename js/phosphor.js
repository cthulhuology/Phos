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
Object.prototype.functionalize = function(i) {
	var str = (("" + this).split("\n")).join(" "); // Remove \n from defs
	var re = /^[^{]+{(.*)}$/;
	var m = re.exec(str);
	if (m) return m[1];
	return "" + this;
}
Object.prototype.parameterize = function() {
	var str = "" + this;
	var re = /function (\([^)]*\))/;
	var m = re.exec(str);
	if (m) return m[1];
	return "";
}
Object.prototype.property = function(c,k,x,y) {
	var t = Text.init(this).at(x,y).by(200,20);
	t.childof = c;
	t.valueof = k.deparameterized();
	return [ t ];
}
Object.prototype.display = function(x,y) {
	var a = [];
	var $self = this;
	this.each(function(v,k) {
		if (!k || !v) return;
		var t = Text.init(v.parameterize ? k + v.parameterize() : k).at(x,y).by(200,20);
		t.childof = $self;
		y += 28;
		a.push(t);
	});
	return a;
}
String.prototype.deparameterized = function() {
	var re = /(\w+)\(/;
	var m = re.exec(this);
	if (m) return m[1];
	return this;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Array Extensions
Array.prototype.collapse = function() { 
	this.every(function(o,i) { 
		if (o.expanded) o.expanded = o.expanded.collapse();
		o.free();
	})
	return false
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Global pointer
var that;		// the last thing selected
var editing;		// the block we're editing

////////////////////////////////////////////////////////////////////////////////////////////////////
// Widget extensions

Widget.down = function(e) { 
	if(!this.hit(e)) return;
       	that = this; 
	this.moving = e; 
	if (Keyboard.shift) that.init().to(that.w,that.h);
       	if(e.button < 2) return;
	this.contents = this.contents ? this.contents.collapse() : this.display(this.x,this.y+this.h) 
};
Widget.move = function(e) {
		if (!this.moving) return;
		var dx = e.x - this.moving.x;
		var dy = e.y - this.moving.y;
		this.to(dx,dy);
		if (this.parent) this.clamp(this.parent.x,this.parent.y,this.parent.x+this.parent.w,this.parent.y+this.parent.h);
		if (this.contents) this.contents.every(function(v,i) { v.to(dx,dy)});
		if (this.children) this.children.every(function(v,i) { v.to(dx,dy)});
		this.moving = e;

};
Widget.up = function(e) {
		this.moving = false;
		if (!this.hit(e)) return;
		var o = this.overlaps([Display,Phosphor,this]);
		if (!o || !o.is('Graphic') || this == o) return; 
		if (o.children.has(this)) return;
		o.add(this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Hotkey Object
var HotKey = let({ 
	// Text Widget hotkeys
	'x': function() { Phosphor.clipboard = editing.content; editing.free() },
	'c': function() { Phosphor.clipboard = editing.content }, 
	'v': function() { editing.content = editing.content.append(Phosphor.clipboard) },
	'/': function() { Search.find() },
	's': function() { 
		if (editing.childof == localStorage && !editing.valueof) 
			(localStorage[editing.content]).post('objects/' + Phosphor.abbr + '-' + editing.content,
				function(txt) {if (!txt) alert('Failed to save try again') }) }, 
	// Phosphor Widget hotkeys
	'd': function() { 
		if (editing.childof == localStorage && !editing.valueof) 
			(localStorage[editing.content]).download() },
	'o': function() { Display.at(0,0) },
	'r': function() { _doc.location = _doc.location },
	'h': function() { Phosphor.help.show() },
	'i': function() { Phosphor.inventory.show() },
});
 
////////////////////////////////////////////////////////////////////////////////////////////////////
// Text Object
var Text = let(Widget,{
	bg: "gray",
	moving: false,
	editing: false,
	expanded: false,
	content: false,
	init: function(txt) { 
		var t = Text.clone();
		t.content = txt 
		return t.instance();
	},
	evaluate: function() {
		if (!this.content) return "";
		if (this.childof == localStorage) return this.content;
		var retval = this.content
		Sound.click.play();
		try { 
			retval = eval('(' + this.content + ')') 
		} catch(e) { 
			try {
 				retval = eval( this.content );
 			} catch(ee) {
 				Sound.error.play();
 				alert(e); 
 			}
		};
		return retval;
	},
	press: function(e) {
		if (!this.editing) return;
		if (Keyboard.cmd || Keyboard.ctrl) return;
		this.content =  e.key == Keyboard.enter && this.childof && this.valueof ? 
				this.childof[this.valueof] = this.evaluate():
			e.key == Keyboard.enter ? 
				this.evaluate():
			e.key == Keyboard.backspace ? 
				this.content.length == 0 || Keyboard.shift ? 
					this.done():
					this.content.substring(0,this.content.length-1):
			this.content.append(e.key);
	},
	done: function() {
		Sound.click.play();
		if (this.expanded) this.expanded = this.expanded.collapse();
		this.free();
	},
	expand: function() {
		if (this.valueof) {
			var t  = Text.init(this.childof[this.valueof]).at(this.x+this.w+2,this.y).by(200,20);
			t.expanded = t.expand();
			return false;
		}
		return this.childof ?  
			this.childof[this.content.deparameterized()].property(this.childof,this.content,this.x+this.w+2,this.y):
			this.evaluate().display(this.x,this.y+this.h+4);

	},
	draw: function() {
		if (!this.visible) return;
		Screen[this.editing ? 'white' : 'gray']();
		if (!this.editing && this.childof && this.valueof) this.content = this.childof[this.valueof];
		Screen.at(this.x,this.y+Screen.size).by(this.w-Screen.size,this.h).font('16 Arial').print(this.content);
		this.by(Math.max(this.w,(Screen.x+Display.x)-this.x + Screen.size),(Screen.y+Display.y)-this.y + Screen.size/2);
		Screen.at(this.x-Screen.size/2,this.y).by(this.w,this.h).frame();
	},
	down: function(e) { 
		if (!this.hit(e)) return;
		this.moving = e;
		if (!this.content) return;
		if (e.button < 2) return;
		Sound.click.play();
		this.expanded = this.expanded ? this.expanded.collapse(): this.expand();
	},
	up: function(e) { 
		var o = false;
		var $self = this;
		if (this.moving && (o = App.widgets.any(function(v,k) {
			return ![ $self, Display, Phosphor ].has(v) 
				&& v.can('hit') && v.hit($self) && v.editing }))) {
			if (o.childof && !o.valueof) {
				o.childof[o.content.deparameterized()] = o.childof == localStorage ? this.content : this.evaluate();
				this.free();
			} 
			if (!o.childof) {
				o.evaluate()[this.content] = true;	
				if (o.expanded) o.expanded.collapse();
				o.expanded = o.expand();
				this.free();
			}
		}
		this.moving = false;
	},
	move: function(e) { 
		this.editing = this.hit(e);
		if (this.editing) editing = this;
		if (this.moving) {
			var dx = e.x - this.moving.x;
			var dy = e.y - this.moving.y;
			this.to(e.x - this.moving.x,e.y -this.moving.y );
			if (this.expanded) this.expanded.every(function(o,i) { 
				if (o.expanded) o.expanded.every(function(m,i) { m.to(dx,dy)});
				o.to(dx,dy)});
			this.moving = e;
		}
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Phosphor Environment
var Phosphor = let(Widget,{
	abbr: localStorage['abbr'] || 'yyz',
	clipboard: "",
	init: function() {
		Sound.trash = Sound.init('sounds/trash.aif');
		Sound.error = Sound.init('sounds/error.wav');
		Sound.click = Sound.init('sounds/click.wav');
		this.at(0,Display.h-64).by(Display.w,64);
		this.help = Help.init('images/help_button.png').at(Display.w-100,10);
		this.inventory = Inventory.init();
		return this.instance();
	},
	press: function(e) { if(Keyboard.ctrl || Keyboard.cmd) HotKey.of(e.key); },
	draw: function() {if (!this.visible) return },
	move: function(e) { },
	down: function(e) {
		if (App.widgets.any(function(o) {
			if ( !o.can('hit') || o == Phosphor || o == Display) return false;
			return o.hit(e);
		})) return;
		if (e.button < 2) return;
		Sound.click.play();
		var t = Text.init('');
		t.at(e.x,e.y).by(100,24);
	},
});
////////////////////////////////////////////////////////////////////////////////////////////////////
// Help Object
var Help = let(Image,{
	down: function(e) {
		if (!this.hit(e) || this.blurb) return;
		Sound.click.play();
		this.blurb = Image.init('images/help.png').at(300,0);
		this.blurb.down = function(e) { 
			if(!this.hit(e)) return;
			Sound.click.play();
			Phosphor.help.blurb = false;
			this.free();
		};
	},
	show: function() { this.down(this); },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Inventory Object
var Inventory = let(Widget,{
	init: function() { 
		Objects.each(function(v,k) { if (v) localStorage[k] = k });
		var i = this.clone().instance();
		i.button = Image.init('images/inventory_button.png').at(0,10);
		i.trash = Image.init('images/trash.png').at(Display.w-64,Display.h-64);
		i.trash.up = function(e) {
			var o =  this.overlaps([Display,Phosphor,this]);
			if (!o || !o.editing) return;
			Sound.trash.play();
			delete localStorage[o.content.deparameterized()];
			o.free();
		};
		i.trash.down = false;
		i.button.down = function(e) { if (this.hit(e)) Phosphor.inventory.show() };
		i.button.up = function(e) { 
			var o = this.overlaps([Display,this]);
			if (!o || !o.editing) return;
			localStorage[o.content.deparameterized()] = true;
			Phosphor.inventory.show();	
			o.free();
		};
		i.at(10,50).get('objects/',function(txt) { 
			eval('(' + txt + ')').each(function(v,k) { localStorage[k] = unescape(v) });
		});
		return i;
	},
	show: function() { 
		this.content = this.content ? this.content.collapse() : localStorage.display(this.x,this.y);
	},
});
////////////////////////////////////////////////////////////////////////////////////////////////////
// End
