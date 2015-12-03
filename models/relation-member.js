'use strict';
/*
 * Model for Relations
 *
 * Schema http://chrisnatali.github.io/osm_notes/osm_schema.html#relation_members
 *
 */

var RelationMember = {
  tableName: 'current_relation_members',
  attributes: {
    relation_id: {
      type: 'integer',
      model: 'Relation'
    },
    member_type: {
      type: 'string'
    },
    member_id: {
      type: 'integer'
    },
    member_role: {
      type: 'string'
    },
    sequence_id: {
      type: 'integer'
    }
  },

  fromEntity: function(entity) {
    var model = {};
    model.relation_id = entity.relation;
    model.member_type = entity.type.slice(0,1).toUpperCase() + entity.type.slice(1);
    model.member_id = parseInt(entity.ref, 10);
    model.member_role = entity.role || ' ';
    model.sequence_id = entity.i;
    return model;
  },
};

module.exports = RelationMember;
