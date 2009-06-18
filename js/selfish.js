// selfish.js
//
// Copyright (C) 2009 David J. Goehrig
// All Rights Reserved
//
////////////////////////////////////////////////////////////////////////////////////////////////////
// String prototype extensions
String.prototype.last = function() { return this.substring(this.length-1) }
String.prototype.first = function() { return this.substring(0,1) }
String.prototype.decode = function() { return unescape(this) }
String.prototype.encode = function() { return escape(this) }
String.prototype.append = function() {
	var retval = this;
	for (var i = 0; i < arguments.length; ++i)
		retval += arguments[i].toString();
	return retval;
}
////////////////////////////////////////////////////////////////////////////////////////////////////
// Object prototype extensions
Object.prototype.attempt = function() {
	try { eval('('.alongside(this.toString(),')')) } catch(e) { 
		try { eval(this) } catch(ee) { alert(e) } }
}

Object.prototype.each = function(f) {
	for (var k in this)
		if (this.hasOwnProperty(k) && k != 'prototype')
			f(this[k],k);
	return this;
}

Object.prototype.clone = function() {
	var Proto = function() {};
	Proto.prototype = this;
	return new Proto();
}

Object.prototype.child = function() {
	var o = {};
	this.each(function(v,k) { o[k] = v });	
	return o;
}

Object.prototype.let = function() {
	var o = { init: function() { return this } };
	for (var i = 0; i < arguments.length; ++i)
		arguments[i].each(function(v,k) { o[k] = v });
	return o;
}

Object.prototype.from = function(k,v) {
	this[k.last() == "*" ? k : k.alongside('*')] = v;
	return this;
}

Object.prototype.parents = function() {
	var a = [];
	this.each(function(v,k) { if (k.last() == "*") a.push(v) });
	return a;
}

Object.prototype.can = function(k) {
	return (typeof(this[k]) == "function");
}

Object.prototype.has = function(k) {
	return (typeof(this[k]) == "object" ||
		typeof(this[k]) == "string" ||
		typeof(this[k]) == "number")
}

Object.prototype.slots = function() {
	var i = 0;
	this.each(function(v,k) { if (k && v) ++i });
	return i;
}

Object.prototype.of = function(x) { 
	var args = []; 
	for (var i = 1; i < arguments.length; ++i) 
		args.push(arugments[i]); 
	if (this.can(x)) return this[x](args);
	this.parents().every(function(p,i) { if (p.can(x)) this[x] = p[x] });
	if (this.can(x)) return this[x](args);
	return this;	
}

Object.prototype.is = function(x) {
	var $self = this;
	var retval = true;
	x.each(function(v,k) { if (x.can(k) && !$self.can(k)) return retval = false });
	return retval;
}

Object.prototype.any = function(f) {
	var retval = null;
	this.each(function(v,k) { if (f(v,k)) return retval = v });
	return retval;	
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Array extensions
Array.prototype.every = function(f) {
	for (var i = 0; i < this.length; ++i)
		f(this[i],i);
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
	
Array.prototype.has = function(e) {
	var retval = false;
	this.every(function(x,i) { if (x == e) return retval = true });
	return retval;
}

Array.prototype.append = function(a) {
	a.every(function(x,i) { this.push(x) });
}

Array.prototype.cum = function() {
	for (var i = 0; i < arguments.length; ++i)
		this.push(arguments[i]);
	return this;
}

Array.prototype.except = function (e) { 
	for (var i = 0; i < this.length; ++i) if (this[i] == e) this.splice(i,1);	
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// HTML Element Extensions
Element.prototype.add = function(e) {
	this.appendChild(e);
	return this;
}

Element.prototype.listen = function(e,f) {
	this.addEventListener(e,f,false);
	return this;
}

function $(x) { return document.getElementById(x) }
function $_(x) { return document.createElement(x) }

