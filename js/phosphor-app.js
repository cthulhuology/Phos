////////////////////////////////////////////////////////////////////////////////////////////////////
// phosphor-app.js
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// About
var About = let(Image,{
	show: function() { this.at(100,10).load('img','images/about_button.png') },
	down: function(e) { 
		if (!e.on(this)) return;
		this.blurb = an(Image,'images/about.png').at(Display.w/2-150,Display.h/2-150).copy({ 
			down: function(e) { if(e.on(this)) this.free() }});
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tutorial
var Tutorial = let(Block,{
	content: 'Click here to visit a Tutorial',
	show: function() { this.at(Display.w/2-120,20).by(240,20) },
	down: function(e) { if (e.on(this)) document.location = '/tutorial' },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Blog
var Blog = let(Image,{
	show: function() { this.at(200,10).load('img','images/blog.png') },
	down: function(e) { if (e.one(this)) _doc.location = 'http://blog.dloh.org' },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// YouTube Videos
var YouTube = let(Widget,{
	init: function(id) {
		var y = this.clone().instance();
		y.id = id;
		y.d = $_('div');	
		y.d.innerHTML = '<object width="425" height="344"><param name="movie" value="http://www.youtube.com/v/' + y.id + '&color1=0xb1b1b1&color2=0xcfcfcf&hl=en&feature=player_embedded&fs=1"></param><param name="allowFullScreen" value="true"></param><param name="allowScriptAccess" value="always"></param><embed src="http://www.youtube.com/v/' + y.id + '&color1=0xb1b1b1&color2=0xcfcfcf&hl=en&feature=player_embedded&fs=1" type="application/x-shockwave-flash" allowfullscreen="true" allowScriptAccess="always" width="425" height="344"></embed></object>';
		y.d.style.position = 'absolute';
		y.d.style.top = this.y;
		y.d.style.left = this.x;
		y.d.style.zIndex = 2;
		y.w = y.d.style.width = 425;
		y.h = y.d.style.height = 344;
		_body.add(y.d);
		return y;
	},
	draw: function() {
		this.clamp(0,0,Display.w,Display.h);
		this.d.style.top = this.y;
		this.d.style.left = this.x;
	},
	play: function() { },
	pause: function() { },
	free: function() { _body.removeChild(this.d); }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Search
var Search = let(Block,{
	find: function() {
		if (this.expanded) this.expanded = this.expanded.collapse();
		if (this.visible) return this.visible = false;
		this.says('').show();
		Sound.click.play();
		this.at(Display.w/2-100,Display.h/2-20).by(200,40);
	},
	evaluate: function() {
		if (this.expanded) this.expanded = this.expanded.collapse();
		Sound.click.play();
		this.results = {};
		$self = this;
		Objects.each(function(o,k){ 
			if (o.can($self.content.deparameterized())) $self.results[k] = o;
		});
		this.expanded = this.results.display(this.x,this.y+this.h);
		return this.content;
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// startup function
function startup() {
	Phosphor.init();
	Tutorial.instance().show();
	About.instance().show();
	Blog.instance().show();
	Search.instance().hide();
}
