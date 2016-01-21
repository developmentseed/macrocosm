'use strict';

/**
* Way.js
*
* @description :: Represents ways, or roads.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#current_ways
*
*/

var _ = require('lodash');

var log = require('../services/log.js');
var Chunk = require('../services/chunk.js');
var WayNode = require('./way-node.js');
var WayTag = require('./way-tag.js');
var validateArray = require('../util/validate-array');

var Way = {
  tableName: 'current_ways',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      numerical: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      primaryKey: true,
      autoIncrement: true,
      index: true,
      model: 'changesets'
    },
    timestamp: {
      type: 'datetime',
      date: true
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    version: {
      type: 'integer',
      numeric: true,
      index: true
    },
  },

  fromEntity: function(entity, meta) {
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timestamp = new Date();

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

  fromOSM: function(xml) {

    // Transfer all attributes.
    var model = {};
    var attributes = xml.attrs();
    for (var i = 0, ii = attributes.length; i < ii; ++i) {
      var attr = attributes[i];
      model[attr.name()] = attr.value();
    }

    // Transfer tags and way nodes.
    var children = xml.childNodes();
    var tags = [];
    var nd = [];
    for (var i = 0, ii = children.length; i < ii; ++i) {
      var child = children[i];
      var type = child.name();
      if (type === 'tag') {
        tags.push({
          k: child.attr('k').value(),
          v: child.attr('v').value()
        });
      }
      else if (type === 'nd') {
        nd.push({
          ref: child.attr('ref').value()
        });
      }
    }
    model.tag = tags;
    model.nd = nd;
    return model;
  },

  canBeDeleted: function(way_id) {
    // TODO add relations support
    return new Promise(function(fullfill, reject) {
      fullfill(true)
    })
  },

  attachNodeIDs: function(ways, wayNodes) {
    // For each way, attach every node it contains using the wayNodes server
    //response.
    for (var j = 0, jj = ways.length; j < jj; ++j) {
      var way = ways[j];
      var nodesInWay = [];
      for (var i = 0, ii = wayNodes.length; i < ii; ++i) {
        var wayNode = wayNodes[i];
        if (wayNode.way_id === way.id) {
          nodesInWay.push(wayNode);
        }
      }
      way.nodes = nodesInWay;
    }
    return ways;
  },

  save: function(q) {
    var actions = [];
    var model = this;
    ['create', 'modify', 'delete'].forEach(function(action) {
      if (q.changeset[action] && q.changeset[action].way) {
        actions.push(action);
      }
    });
    return Promise.all(actions.map(function(action) {
      return model[action](q);
    }))
    .catch(function(err) {
      log.error('Way changeset fails', err);
      throw new Error(err);
    });
  },

  create: function(q) {

    var raw = q.changeset.create.way;

    if (!Array.isArray(raw)) {
      raw = [raw];
    }

    // Create a list of models of just way creations with proper attributes.
    var models = raw.map(function(entity) { return Way.fromEntity(entity, q.meta); });

    return Promise.all(Chunk(models).map(function(models) {
      return q.transaction(Way.tableName).insert(models).returning('id');
    }))
    .then(function(_ids) {
      var ids = [].concat.apply([], _ids);
      log.info('Remapping', ids.length, 'way IDs');
      var wayNodes = [];
      var tags = [];
      raw.forEach(function(entity, i) {
        // Map old id to new id.
        q.map.way[entity.id] = ids[i];
        // Update the changed id.
        entity.id = ids[i];
        // Take the node ID from the attached nd, unless it's less than zero;
        // In which case, use the value saved in map#node
        wayNodes.push(entity.nd.map(function(wayNode, i) {
          var id = parseInt(wayNode.ref, 10) > 0 ? wayNode.ref : q.map.node[wayNode.ref];
          return {
            way_id: entity.id,
            sequence_id: i,
            node_id: id
          };
        }));
        // Check if tags are present, and if so, save them.
        if (entity.tag) {
          var _tags = validateArray(entity.tag);
          tags.push(_tags.map(function(tag) {
            return {
              k: tag.k,
              v: tag.v,
              way_id: entity.id
            };
          }));
        }
      });

      wayNodes = [].concat.apply([], wayNodes);
      return Promise.all(Chunk(wayNodes).map(function(wn) {
        return q.transaction(WayNode.tableName).insert(wn);
      }))
      .then(function() {
        if (tags.length) {
          tags = [].concat.apply([], tags);
          return Promise.all(Chunk(tags).map(function(t) {
            return q.transaction(WayTag.tableName).insert(t);
          }));
        }
        return [];

      });
    })
    .catch(function(err) {
      log.error('Inserting new ways', err);
      throw new Error(err);
    });
  },

  modify: function(q) {
    var raw = q.changeset.modify.way;

    if (!Array.isArray(raw)) {
      raw = [raw];
    }

    return Promise.all(raw.map(function(entity) {
      var model = Way.fromEntity(entity, q.meta);
      return q.transaction(Way.tableName).where({ id: entity.id }).update(model)
    }))

    // Delete old wayNodes and wayTags
    .then(function() {
      var ids = raw.map(function(entity) { return parseInt(entity.id, 10); });
      return q.transaction(WayNode.tableName).whereIn('way_id', ids).del().then(function() {
        return q.transaction(WayTag.tableName).whereIn('way_id', ids).del();
      });
    })

    // Create new wayNodes and wayTags
    .then(function() {
      var tags = [];
      var wayNodes = [];
      raw.forEach(function(entity) {
        wayNodes.push(entity.nd.map(function(wayNode, i) {
          // Take the node ID from the attached nd, unless it's less than zero;
          // In which case, use the value saved in map#node
          var nodeId = parseInt(wayNode.ref, 10) > 0 ? wayNode.ref : q.map.node[wayNode.ref];
          return {
            way_id: entity.id,
            sequence_id: i,
            node_id: nodeId
          }
        }));
        if (entity.tag && entity.tag.length) {
          tags.push(entity.tag.map(function(tag) {
            return {
              k: tag.k,
              v: tag.v,
              way_id: entity.id
            };
          }));
        }
      });

      if (tags.length) {
        tags = [].concat.apply([], tags);
        // We execute this query as a side-effect on purpose;
        // Nothing depends on it, and it can execute asynchronously of anything else.
        q.transaction(WayTag.tableName).insert(tags).catch(function(err) {
          log.error('Creating way tags in create', err);
          throw new Error(err);
        });
      }
      wayNodes = [].concat.apply([], wayNodes);
      return q.transaction(WayNode.tableName).insert(wayNodes);
    })
    .catch(function(err) {
      log.error('Modifying ways', err);
      throw new Error(err);
    });
  },

  'delete': function(q) {
    var ids = _.pluck(q.changeset['delete'].way, 'id');
    return q.transaction(Way.tableName).whereIn('id', ids)
    .update({ visible: false, changeset_id: q.meta.id }).returning('id')
    .then(function(invisibleWays) {
      q.transaction(WayTag.tableName).whereIn('way_id', invisibleWays).del();
      return q.transaction(WayNode.tableName).whereIn('way_id', invisibleWays).del()
    })
    .catch(function(err) {
      log.error('Deleting ways in delete', err);
      throw new Error(err);
    });
  }
};

module.exports = Way;
