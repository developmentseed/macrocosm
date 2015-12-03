'use strict';
var Promise = require('bluebird');
var Boom = require('boom');
var quadTile = require('../services/quad-tile.js');
var queryWays = require('./query-ways.js');

module.exports = function queryBbox(knex, bbox) {
  // Calculate the tiles within this bounding box.
  // See services/quadTile.js.
  var tiles = quadTile.tilesForArea(bbox);

  if(bbox.error) return Promise.reject(Boom.badRequest(bbox.error));

  // Find the nodes in the bounding box using the quadtile index.
  var containedNodes = knex('current_nodes')
    .whereIn('tile', tiles)
    .where('visible',true)
    .select('id');

  var containedWayIds = knex('current_way_nodes')
    .whereIn('node_id', containedNodes)
    .select('way_id');

  return queryWays(knex, containedWayIds);
};

