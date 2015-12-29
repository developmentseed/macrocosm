'use strict';
var Hapi = require('hapi');
var xml2json = require('xml2json');

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
  if (req.mime === 'text/xml') {
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
