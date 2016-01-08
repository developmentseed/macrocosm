'use strict';
/*
 * Model for Relations
 *
 * Schema http://chrisnatali.github.io/osm_notes/osm_schema.html#relations
 *
 */

var _ = require('lodash');

var Member = require('./relation-member.js');
var RelationTag = require('./relation-tag.js');
var log = require('../services/log');

var validateArray = require('../util/validate-array');

var Relation = {

  tableName: 'current_relations',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      index: true
    },
    version: {
      type: 'integer',
      numeric: true,
      required: true
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
    redaction_id: {
      type: 'integer',
      numeric: true
    }
  },


  fromEntity: function(entity, meta) {
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timestamp = new Date();

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
  },

  createDependents: function(raw, ids, map, transaction) {
    var tags = [];
    var members = [];
    raw.forEach(function(entity, i) {

      var id = ids[i];
      if (entity.tag) {
        var _tags = validateArray(entity.tag);
        tags.push(_tags.map(function(tag) {
          return {
            k: tag.k,
            v: tag.v,
            relation_id: id
          };
        }));
      }

      if (entity.member) {
        var _members = validateArray(entity.member);
        members.push(_members.map(function(member, i) {

          // We can use the map variable to get the newly-created entity ID
          // if the one that came from the editor is a negative value.
          if (parseInt(member.ref, 10) < 0) {
            member.ref = map[member.type][member.ref];
          }
          member.relation = id;
          member.i = i;
          return Member.fromEntity(member);
        }));
      }
    });

    return Promise.all([
      {data: members, table: Member.tableName},
      {data: tags, table: RelationTag.tableName}
    ].map(function(d) {
      if (d.data.length) {
        var data = [].concat.apply([], d.data);
        return transaction(d.table).insert(data);
      }
      return [];
    }))
    .catch(function(err) {
      log.error('Creating relation tags and members', err);
      throw new Error(err);
    });
  },

  destroyDependents: function(ids, transaction) {
    return Promise.all([
      transaction(Member.tableName).whereIn('relation_id', ids).del(),
      transaction(RelationTag.tableName).whereIn('relation_id', ids).del()
    ]).catch(function(err) {
      log.error('Destroying relation tags and members', err);
    });
  },

  save: function(q) {
    var actions = [];
    var model = this;
    ['create', 'modify', 'delete'].forEach(function(action) {
      if (q.changeset[action] && q.changeset[action].relation) {
        actions.push(action);
      }
    });
    return Promise.all(actions.map(function(action) {
      return model[action](q);
    }))
    .catch(function(err) {
      log.error('Relation changeset fails', err);
      throw new Error(err);
    });
  },

  create: function(q) {
    var raw = validateArray(q.changeset.create.relation);

    var models = raw.map(function(entity) {
      return Relation.fromEntity(entity, q.meta);
    });

    return q.transaction(Relation.tableName).insert(models).returning('id')
    .then(function(ids) {
      // We don't necessarily need to update these ids, but it's useful for testing,
      // as this will be included in the server response.
      raw.forEach(function(entity, i) {
        q.map.relation[entity.id] = ids[i];
      });

      // Save members and tags.
      return Relation.createDependents(raw, ids, q.map, q.transaction);
    })
    .catch(function(err) {
      log.error('Inserting new relations', err);
      throw new Error(err);
    });
  },

  modify: function(q) {
    var raw = q.changeset.modify.relation;

    if (!Array.isArray(raw)) {
      raw = [raw];
    }

    var ids = _.pluck(raw, 'id');

    return Promise.all(raw.map(function(entity) {
      var model = Relation.fromEntity(entity, q.meta);
      return q.transaction(Relation.tableName).where({ id: entity.id }).update(model)
    }))
    .then(function() {
      return Relation.destroyDependents(ids, q.transaction);
    })
    .then(function() {
      return Relation.createDependents(raw, ids, q.map, q.transaction);
    })
    .catch(function(err) {
      log.error('Modifying relationship status, it\'s complicated', err);
      throw new Error(err);
    });
  },

  // TODO this destroy function does not implement a check
  // to see if any relation is a part of any other relation.
  'delete': function(q) {
    var raw = q.changeset['delete'].relation;

    if (!Array.isArray(raw)) {
      raw = [raw];
    }

    var ids = _.pluck(raw, 'id');

    return q.transaction(Relation.tableName).whereIn('id', ids)
    .update({ visible: false, changeset_id: q.meta.id }).returning('id')
    .then(function(removed) {
      return Relation.destroyDependents(removed, q.transaction);
    })
    .catch(function(err) {
      log.error('Deleting relations in delete', err);
      throw new Error(err);
    });
    return query;
  }
};

module.exports = Relation;
