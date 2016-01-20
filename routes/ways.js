'use strict';

var Boom = require('boom');

var knex = require('../connection.js');
var queryWays = require('../services/query-ways.js');
var XML = require('../services/xml.js');
var Node = require('../models/node-model.js');

module.exports = [
  {
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
        console.log(err);
        res(Boom.wrap(err));
      });
    }
  }
];
