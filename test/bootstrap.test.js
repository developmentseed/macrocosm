'use strict';

require('should');
var server = require('../');

server.register(require('inject-then'), function (err) {
  if (err) throw err;
});

module.exports = server;
