'use strict';

var _debug = require('debug');
var Hapi = require('hapi');
var util = require('util');
var xml2json = require('xml2json');

var meta = require('./package.json');
var debug = _debug(util.format('%s:http', meta.name));

var server = new Hapi.Server({
  connections: {
    routes: {
      cors: true
    }
  },
  debug: process.env.MACROCOSM_DEBUG ? {
    log: [ 'error' ],
    request: [ 'error', 'received', 'response' ]
  } : false
});

server.connection({ port: process.env.PORT || 4000 });


server.ext('onRequest', function(req, res) {
  debug('href: %s', req.url.href);
  return res.continue();
});

// Register routes
server.register({
  register: require('hapi-router'),
  options: {
    routes: 'routes/*.js'
  }
}, function (err) {
  if (err) throw err;
});

server.ext('onPostAuth', function(req, res) {
  if (req.mime === 'text/xml' && Object.keys(req.payload || {}).length > 0) {
    debug('payload: %s', req.payload);
    req.payload = xml2json.toJson(req.payload, {
      object: true
    });
  }

  return res.continue();
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});

module.exports = server;
