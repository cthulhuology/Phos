////////////////////////////////////////////////////////////////////////////////////////////////////
// phosphor-db.js
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
// Database

An.object().named('Database').from({
	init: function(name) {
		try {
			this.db = openDatabase(name,'','Phosphor Database',4096*4096);
		} catch(e) {
			alert(e);
		}
		return this;
	},
	query: function(s,c) {
		var args = [];
		var $self = this;
		this.cb = c;
		for (var i = 2; i < arguments.length; ++i) args[i] = arguments[i];
		this.db.transaction(function(t) { t.executeSql(s,args,$self.result,$self.failure) });
		return this;
	},
	result: function(t,r) {
		if (this.cb) r.every(this.cb);
		this.results = r;
	},
	failure: function(t,e) {
		alert('Database Error: ' + e.message)
		this.error = e;
	},
});

