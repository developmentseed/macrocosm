'use strict';
/**
 * Nodes.js
 *
 * @description :: Represents nodes.
 * Schema: http://chrisnatali.github.io/osm_notes/osm_schema.html#current_nodes
 *
 */

var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');

var knex = require('../connection.js');
var log = require('../services/log.js');
var RATIO = require('../services/ratio.js');
var QuadTile = require('../services/quad-tile.js');
var Chunk = require('../services/chunk.js');
var NodeTag = require('./node-tag.js');
var WayNode = require('./way-node.js');
var Way = require('./way.js');

var Node = {

  tableName: 'current_nodes',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      index: true
    },
    latitude: {
      type: 'integer',
      required: true,
      numeric: true,
      truthy: true
    },
    longitude: {
      type: 'integer',
      required: true,
      numeric: true,
      truthy: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      model: 'changesets'
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    timestamp: {
      type: 'datetime',
      datetime: true
    },
    tile: {
      type: 'integer',
      index: true,
      numeric: true,
      required: true
    },
    version: {
      type: 'integer',
      numeric: true,
      required: true
    },
  },

  fromEntity: function(entity, meta) {
    var ratio = RATIO;
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timestamp = new Date();
    if (entity.lat && entity.lon) {
      entity.lat = parseFloat(entity.lat);
      entity.lon = parseFloat(entity.lon);
      model.latitude = entity.lat * ratio | 0;
      model.longitude = entity.lon * ratio | 0;
      model.tile = QuadTile.xy2tile(QuadTile.lon2x(entity.lon), QuadTile.lat2y(entity.lat));
    }

    // Parse int on entity.id, so we can see if it's a negative id.
    var id = parseInt(entity.id, 10);
    if (id && id > 0) {
      model.id = id;
    }
    if (entity.changeset) {
      model.changeset_id = parseInt(entity.changeset, 10);
    }
    else if (meta && meta.id) {
      model.changeset_id = parseInt(meta.id);
    }
    return model;
  },

  // Return an entity from a JSON node.
  fromOSM: function(xml) {

    // Transfer all attributes.
    var model = {};
    var attributes = xml.attrs();
    for (var i = 0, ii = attributes.length; i < ii; ++i) {
      var attr = attributes[i];
      model[attr.name()] = attr.value();
    }

    // Transfer tags.
    var children = xml.childNodes();
    var tags = [];
    for (var i = 0, ii = children.length; i < ii; ++i) {
      var t = children[i];
      if (t.name() === 'tag') {
        tags.push({
          k: t.attr('k'),
          v: t.attr('v')
        });
      }
    }
    model.tag = tags;
    return model
  },

  canBeDeleted: function(nodeId) {
    // No need to call parseInt on node_id, as that's already handled upstream.
    return knex(WayNode.tableName)
    .where('node_id', nodeId)
    .then(function wayNodeResp(wayNodes) {
      // If this node belongs to a way, check to see if
      // any of those ways are visible, aka not deleted yet.
      // Return false if this node is still part of an existing way.
      if (wayNodes) {
        return knex(Way.tableName).whereIn('id',_.pluck(wayNodes, 'way_id'))
        .then(function(ways) {
          var visible = _.chain(ways)
          .pluck('visible')
          .reduce(function(curr, val) { return curr && val; }, true)
          .value();
          return visible;
        });
      } else {
        return true;
      }
    })
    .catch(function(err) {
      throw new Error(err);
    });
  },

  // Attach a list of tags to a list of entities
  // by creating a mapping of entities by their id.
  withTags: function(entities, tags, accessor) {
    if (!tags.length) {
      return entities;
    }
    var map = {};
    for(var i = 0, ii = entities.length; i < ii; ++i) {
      var entity = entities[i];
      map[entity.id] = entity;
    }
    for(i = 0, ii = tags.length; i < ii; ++i) {
      var tag = tags[i];
      var entity = map[tag[accessor]];
      if (entity) {
        if (entity.tags === undefined) {
          entity.tags = [];
        }
        entity.tags.push(tag);
      }
    }
    return entities;
  },

  save: function(q) {
    var actions = [];
    var model = this;
    ['create', 'modify', 'delete'].forEach(function(action) {
      if (q.changeset[action].node) {
        actions.push(action);
      }
    });
    return Promise.map(actions, function(action) {
      return model[action](q);
    })
    .catch(function(err) {
      log.error('Node changeset fails', err);
      throw new Error(err);
    });
  },

  create: function(q) {

    var raw = q.changeset.create.node;

    // Map each node creation to a model with proper attributes.
    var models = raw.map(function(entity) { return Node.fromEntity(entity, q.meta); });

    function remap(_ids) {
      var ids = [].concat.apply([], _ids);
      log.info('Remapping', ids.length, 'node IDs');
      var tags = [];
      raw.forEach(function(entity, i) {
        // create a map of the old id to new id for ways, relations to reference.
        q.map.node[entity.id] = ids[i];
        // update the new node id on the changeset
        // TODO is this step necessary?
        entity.id = ids[i];
        // Check for Node tags. If they exist, they will be in the form of an array.
        if (entity.tag && entity.tag.length) {
          tags.push(entity.tag.map(function(t) {
            return {
              k: t.k,
              v: t.v,
              node_id: entity.id
            };
          }));
        }
      });
      return tags;
    }

    function saveTags (tags) {
      // Only save tags if there are any.
      if (tags.length) {
        tags = [].concat.apply([], tags);

        return Promise.map(Chunk(tags), function(tags) {
          return q.transaction(NodeTag.tableName).insert(tags)
        }, {concurrency: 1})

        .catch(function(err) {
          log.error('Creating node tags in create', err);
          throw new Error(err);
        });
      }
      return [];
    }

    return Promise.map(Chunk(models), function(models) {
      return q.transaction(Node.tableName).insert(models).returning('id');
    }, {concurrency: 1})
    .then(remap)
    .then(saveTags)
    .catch(function(err) {
      log.error('Inserting new nodes in create', err);
      throw new Error(err);
    });
  },

  modify: function(q) {
    var raw = q.changeset.modify.node;

    function deleteTags () {
      var ids = raw.map(function(entity) { return parseInt(entity.id, 10); });
      return q.transaction(NodeTag.tableName).whereIn('node_id', ids).del();
    }

    return Promise.map(raw, function(entity) {
      return q.transaction(Node.tableName).where({id: entity.id})
        .update(Node.fromEntity(entity, q.meta));
    })
    .then(deleteTags)
    .then(function () {
      var tags = [];
      raw.forEach(function(entity, i) {
        if (entity.tag && entity.tag.length) {
          tags.push(entity.tag.map(function(t) {
            return {
              k: t.k,
              v: t.v,
              node_id: entity.id
            }
          }));
        }
      });
      if (tags.length) {
        tags = [].concat.apply([], tags);
        return q.transaction(NodeTag.tableName).insert(tags);
      }
      return [];
    })
    .catch(function(err) {
      log.error('Error modifying nodes', err);
      throw new Error(err);
    });
  },

  'delete': function(q) {
    var ids = _.pluck(q.changeset['delete'].node, 'id');

    return q.transaction(Node.tableName).whereIn('id', ids)
    .update({ visible: false, changeset_id: q.meta.id }).returning('id')

    .then(function(invisibleNodes) {
      return q.transaction(NodeTag.tableName).whereIn('node_id', invisibleNodes)
      .del().returning('node_id')
    })

    .tap(function(deleted) {
      // log.info('Nodes set invisible', invisibleNodes.join(', '));
      // log.info('Node tags deleted', deleted.join(', '));
    })

    .catch(function(err) {
      log.error('Error deleting nodes', err);
      throw new Error(err);
    });
  }
};

module.exports = Node;
