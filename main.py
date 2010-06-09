#!/usr/bin/env python
#
# Copyright 2010 David J. Goehrig
#

import os, sys, logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class Main(webapp.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/html'
		self.response.out.write("""<html>
			<head>
			<title>Phosphor Interface Editor</title>
			<script src="js/phos.js"></script>
			</head>
			<body></body>
			</html>""")
	
class Objects(webapp.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'application/json'
		self.response.out.write(os.listdir(os.getcwd() + '/object/'))

def main():
	application = webapp.WSGIApplication(
		[
			('/objects/', Objects),
			('/', Main)
		],
		debug=True)
	run_wsgi_app(application)


if __name__ == '__main__':
	main()
