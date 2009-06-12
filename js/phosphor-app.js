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
	show: function() { this.at(Display.w - 100,Display.h-40).load('img','images/about_button.png') },
	down: function(e) { 
		if (!this.hit(e)) return;
		this.blurb =  Image.init('images/about.png').at(Display.w/2-150,Display.h/2-150); 
		this.blurb.down = function(e) { if(this.hit(e)) this.free() };
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tutorial
var Tutorial = let(Text,{
	content: 'Click here to visit a Tutorial',
	show: function() { this.at(Display.w/2-120,Display.h-30).by(240,20) },
	down: function(e) { if (this.hit(e)) document.location = '/tutorial' },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Blog
var Blog = let(Image,{
	show: function() { this.at(0,Display.h-40).load('img','images/blog.png') },
	down: function(e) { if (this.hit(e)) _doc.location = 'http://blog.dloh.org' },
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// startup function
function startup() {
	Phosphor.init();
	Tutorial.instance().show();
	About.instance().show();
	Blog.instance().show();
}
