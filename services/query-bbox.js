'use strict';

var Boom = require('boom');

var quadTile = require('../services/quad-tile.js');
var ratio = require('./ratio.js');

module.exports = function queryBbox(knex, bbox) {
  // functions and queries derived from
  // [cgimap](https://github.com/openstreetmap/cgimap)
  // see src/backend/apidb/readonly_pgsql_selection.cpp

  function selectNodesFromBbox(bbox) {
    // Calculate the tiles within this bounding box.
    // See services/quadTile.js.
    var tiles = quadTile.tilesForArea(bbox);

    if (bbox.error) {
      return Promise.reject(Boom.badRequest(bbox.error));
    }

    return knex('current_nodes')
      .whereIn('tile', tiles)
      .whereBetween('latitude', [(bbox.minLat * ratio) | 0, (bbox.maxLat * ratio) | 0])
      .whereBetween('longitude', [(bbox.minLon * ratio) | 0, (bbox.maxLon * ratio) | 0])
      .where('visible', true)
      .select('id')
      .pluck('id');
  }

  function selectWaysFromNodes(nodeIds) {
    return knex('current_way_nodes')
      .whereIn('node_id', nodeIds)
      .distinct('way_id AS id')
      .then(function(rows) {
        return rows.map(function(row) {
          return row.id;
        });
      });
  }

  function selectNodesFromWays(wayIds) {
    return knex('current_way_nodes')
      .whereIn('way_id', wayIds)
      .distinct('node_id AS id')
      .then(function(rows) {
        return rows.map(function(row) {
          return row.id;
        })
      });
  }

  function selectRelationsFromWays(wayIds) {
    return knex('current_relation_members')
      .where('member_type', 'Way')
      .whereIn('member_id', wayIds)
      .distinct('relation_id AS id')
      .then(function(rows) {
        return rows.map(function(row) {
          return row.id;
        });
      });
  }

  function selectRelationsFromNodes(nodeIds) {
    return knex('current_relation_members')
      .where('member_type', 'Node')
      .whereIn('member_id', nodeIds)
      .distinct('relation_id AS id')
      .then(function(rows) {
        return rows.map(function(row) {
          return row.id;
        });
      });
  }

  function selectRelationsFromRelations(relationIds) {
    return knex('current_relation_members')
      .where('member_type', 'Relation')
      .whereIn('member_id', relationIds)
      .distinct('relation_id AS id')
      .then(function(rows) {
        return rows.map(function(row) {
          return row.id;
        });
      });
  }

  function selectNodeTags(nodeIds) {
    return knex('current_node_tags')
      .whereIn('node_id', nodeIds)
      .orderBy('node_id')
      .select('node_id AS id', 'k', 'v');
  }

  function selectNodes(nodeIds) {
    return knex('current_nodes')
      .whereIn('id', nodeIds)
      .select('id', 'latitude', 'longitude', 'visible', 'version', 'changeset_id', 'timestamp');
  }

  function selectWayNds(wayIds) {
    return knex('current_way_nodes')
      .whereIn('way_id', wayIds)
      .orderBy('way_id')
      .orderBy('sequence_id', 'asc')
      .select('node_id AS id', 'way_id');
  }

  function selectWayTags(wayIds) {
    return knex('current_way_tags')
      .whereIn('way_id', wayIds)
      .orderBy('way_id')
      .select('way_id AS id', 'k', 'v');
  }

  function selectWays(wayIds) {
    return knex('current_ways')
      .whereIn('id', wayIds)
      .select('id', 'visible', 'version', 'changeset_id', 'timestamp');
  }

  function selectRelationMembers(relationIds) {
    return knex('current_relation_members')
      .whereIn('relation_id', relationIds)
      .orderBy('relation_id')
      .orderBy('sequence_id', 'asc')
      .select('relation_id AS id', 'member_type', 'member_id', 'member_role');
  }

  function selectRelationTags(relationIds) {
    return knex('current_relation_tags')
      .whereIn('relation_id', relationIds)
      .orderBy('relation_id')
      .select('relation_id AS id', 'k', 'v');
  }

  function selectRelations(relationIds) {
    return knex('current_relations')
      .whereIn('id', relationIds)
      .select('id', 'visible', 'version', 'changeset_id', 'timestamp');
  }

  var nodeIds = new Set();
  var wayIds = new Set();
  var relationIds = new Set();

  return selectNodesFromBbox(bbox)
    .then(function(nodes) {
      nodes.forEach(nodeIds.add, nodeIds);

      return selectWaysFromNodes(nodes);
    })
    .then(function(ways) {
      ways.forEach(wayIds.add, wayIds);

      return selectNodesFromWays(ways);
    })
    .then(function(nodes) {
      nodes.forEach(nodeIds.add, nodeIds);

      return Promise.all([
        selectRelationsFromWays([...wayIds]),
        selectRelationsFromNodes([...nodeIds])
      ]);
    })
    .then(function(values) {
      // ways
      values[0].forEach(relationIds.add, relationIds);

      // nodes
      values[1].forEach(relationIds.add, relationIds);

      return selectRelationsFromRelations([...relationIds]);
    })
    .then(function(relations) {
      relations.forEach(relationIds.add, relationIds);

      return Promise.all([
        selectNodes([...nodeIds]),
        selectNodeTags([...nodeIds]),
        selectWays([...wayIds]),
        selectWayNds([...wayIds]),
        selectWayTags([...wayIds]),
        selectRelations([...relationIds]),
        selectRelationMembers([...relationIds]),
        selectRelationTags([...relationIds])
      ])
    })
    .then(function(entities) {
      var nodes = entities.shift();
      var nodeTags = entities.shift();
      var ways = entities.shift();
      var wayNds = entities.shift();
      var wayTags = entities.shift();
      var relations = entities.shift();
      var relationMembers = entities.shift();
      var relationTags = entities.shift();

      nodes = nodes.map(function(node) {
        node.tags = nodeTags.filter(function(tag) {
          return tag.id === node.id
        });

        return node;
      });

      ways = ways.map(function(way) {
        way.nodes = wayNds.filter(function(nd) {
          return nd.way_id === way.id;
        });

        way.tags = wayTags.filter(function(tag) {
          return tag.id === way.id;
        });

        return way;
      });

      relations = relations.map(function(relation) {
        relation.members = relationMembers.filter(function(member) {
          return member.id === relation.id;
        });

        relation.tags = relationTags.filter(function(tag) {
          return tag.id === relation.id;
        });

        return relation;
      });

      return {
        nodes: nodes,
        ways: ways,
        relations: relations
      };
    });
};
