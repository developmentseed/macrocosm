'use strict';

var builder = require('xmlbuilder');

var generator = require('../package.json').name;

var rsp = {
  osm: {
    '@version': '0.6',
    '@generator': generator,
    api: {
      version: {
        '@minimum': '0.6',
        '@maximum': '0.6'
      },
      area: {
        '@maximum': '0.25'
      },
      tracepoints: {
        '@per_page': 5000
      },
      waynodes: {
        '@maximum': 2000
      },
      changesets: {
        '@maximum_elements': 50000
      },
      timeout: {
        '@seconds': 300
      },
      status: {
        '@database': 'online',
        '@api': 'online', // readonly
        '@gpx': 'online' // offline
      }
    }
  }
};

function capabilities(req, res) {
  var response = res(builder.create(rsp).end({
    pretty: true
  }));

  response.type('text/xml');
}

module.exports = [
  {
    method: 'GET',
    path: '/api/capabilities',
    handler: capabilities
  },
  {
    method: 'GET',
    path: '/api/0.6/capabilities',
    handler: capabilities
  }
];
