'use strict';

var Boom = require('boom');

var knex = require('../connection');
var queryWays = require('../services/query-ways');
var log = require('../services/log');
var XML = require('../services/xml');
var Node = require('../models/node-model');

module.exports = [
  {
    /**
     * @api {get} /api/0.6/ways Get one or more ways by ID
     * @apiGroup Features
     * @apiName MultiWay06
     * @apiDescription Returns OSM XML for requested way(s).
     *
     * @apiParam {String} ways Way IDs (comma-delimited)
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/api/0.6/ways?ways=ways=88007350,88027071
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <?xml version="1.0" encoding="UTF-8"?>
     *  <osm version="0.6" generator="macrocosm (v0.1.0)">
     *    <way id="88007350" visible="true" version="3" changeset="9820551" timestamp="2011-11-13T23:47:04.000Z" user="DevelopmentSeed" uid="1">
     *      <nd ref="1022995472"/>
     *      <nd ref="1502285127"/>
     *      <nd ref="1502285133"/>
     *      <nd ref="1502285135"/>
     *      <nd ref="1502285123"/>
     *      <nd ref="1023125541"/>
     *      <nd ref="1502285125"/>
     *      <nd ref="1502281511"/>
     *      <nd ref="1502281474"/>
     *      <nd ref="1502281487"/>
     *      <nd ref="1502281521"/>
     *      <nd ref="1502281508"/>
     *      <nd ref="1023169944"/>
     *      <nd ref="1023169948"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *    </way>
     *    <way id="88027071" visible="true" version="6" changeset="9820551" timestamp="2011-11-14T00:15:25.000Z" user="DevelopmentSeed" uid="1">
     *      <nd ref="1502281457"/>
     *      <nd ref="1502281509"/>
     *      <nd ref="1502281491"/>
     *      <nd ref="1502281514"/>
     *      <nd ref="1502281517"/>
     *      <nd ref="1502271609"/>
     *      <nd ref="1502271614"/>
     *      <nd ref="1502281476"/>
     *      <nd ref="1502281487"/>
     *      <nd ref="1502281507"/>
     *      <nd ref="1502281453"/>
     *      <nd ref="1502281502"/>
     *      <nd ref="1502281483"/>
     *      <nd ref="1502281500"/>
     *      <nd ref="1502281492"/>
     *      <nd ref="1502281456"/>
     *      <nd ref="1502281452"/>
     *      <nd ref="1502281516"/>
     *      <nd ref="1502281506"/>
     *      <nd ref="1502281489"/>
     *      <nd ref="1502281512"/>
     *      <nd ref="1502281478"/>
     *      <nd ref="1502281458"/>
     *      <nd ref="1502281490"/>
     *      <nd ref="1502281470"/>
     *      <nd ref="1502281471"/>
     *      <nd ref="1502281466"/>
     *      <nd ref="1502281479"/>
     *      <nd ref="1502281459"/>
     *      <nd ref="1502281525"/>
     *      <nd ref="1502281481"/>
     *      <nd ref="1502281467"/>
     *      <nd ref="1502281504"/>
     *      <nd ref="1502281460"/>
     *      <nd ref="1502281455"/>
     *      <nd ref="1502281473"/>
     *      <nd ref="1502281485"/>
     *      <nd ref="1502281505"/>
     *      <nd ref="1502281508"/>
     *      <nd ref="1502281450"/>
     *      <nd ref="1502281493"/>
     *      <nd ref="1023169909"/>
     *      <nd ref="1023169947"/>
     *      <nd ref="1502308242"/>
     *      <nd ref="1023169955"/>
     *      <nd ref="1502267313"/>
     *      <nd ref="1502267314"/>
     *      <nd ref="1502267315"/>
     *      <nd ref="1502317860"/>
     *      <nd ref="1502281510"/>
     *      <nd ref="1502263378"/>
     *      <nd ref="1502263430"/>
     *      <nd ref="1502263404"/>
     *      <nd ref="1502263413"/>
     *      <nd ref="1502263446"/>
     *      <nd ref="1502263415"/>
     *      <nd ref="1502263449"/>
     *      <nd ref="1502263384"/>
     *      <nd ref="1502263385"/>
     *      <nd ref="1502263448"/>
     *      <nd ref="1502263444"/>
     *      <nd ref="1502263426"/>
     *      <nd ref="1502263383"/>
     *      <nd ref="1502263443"/>
     *      <nd ref="1502263437"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *      <tag k="highway" v="footway"/>
     *      <tag k="source" v="Bing"/>
     *    </way>
     *  </osm>
     */
    method: 'GET',
    path: '/api/0.6/ways',
    handler: function(req, res) {
      var ids = req.query.ways.split(',').map(Number);

      if (ids.length === 0) {
        return res(Boom.badRequest('IDs must be provided.'));
      }

      queryWays(knex, ids)
      .then(function(result) {
        // TODO probably doesn't return info about multiple nodes
        var xmlDoc = XML.write({
          ways: Node.withTags(result.ways, result.waytags, 'way_id')
        });
        var response = res(xmlDoc.toString());
        response.type('text/xml');
      })
      .catch(function(err) {
        log.error(err);
        return res(Boom.wrap(err));
      });
    }
  }
];
