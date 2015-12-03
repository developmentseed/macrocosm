require('should');
server = require('../');

server.register(require('inject-then'), function (err) {
  'use strict';
  if (err) throw err;
});
