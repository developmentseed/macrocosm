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
    /**
     * @api {GET} /api/capabilities Query server capabilities
     * @apiGroup Misc
     * @apiName Capabilities
     * @apiDescription Return metadata about this server's capabilities.
     * Required by the JOSM and iD editors. Stub information is currently
     * returned.
     *
     * @apiExample {curl} Example Usage:
     *  curl http://localhost:4000/api/capabilities
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <?xml version="1.0"?>
     *  <osm version="0.6" generator="macrocosm">
     *    <api>
     *     <version minimum="0.6" maximum="0.6"/>
     *     <area maximum="0.25"/>
     *     <tracepoints per_page="5000"/>
     *     <waynodes maximum="2000"/>
     *     <changesets maximum_elements="50000"/>
     *     <timeout seconds="300"/>
     *     <status database="online" api="online" gpx="online"/>
     *   </api>
     *  </osm>
     */
    method: 'GET',
    path: '/api/capabilities',
    handler: capabilities
  },
  {
    /**
     * @api {GET} /api/0.6/capabilities Query server capabilities
     * @apiGroup Misc
     * @apiName Capabilities06
     * @apiDescription Return metadata about this server's capabilities.
     * Required by JOSM. Stub information is currently returned.
     *
     * @apiExample {curl} Example Usage:
     *  curl http://localhost:4000/api/0.6/capabilities
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <?xml version="1.0"?>
     *  <osm version="0.6" generator="macrocosm">
     *    <api>
     *     <version minimum="0.6" maximum="0.6"/>
     *     <area maximum="0.25"/>
     *     <tracepoints per_page="5000"/>
     *     <waynodes maximum="2000"/>
     *     <changesets maximum_elements="50000"/>
     *     <timeout seconds="300"/>
     *     <status database="online" api="online" gpx="online"/>
     *   </api>
     *  </osm>
     */
    method: 'GET',
    path: '/api/0.6/capabilities',
    handler: capabilities
  }
];
