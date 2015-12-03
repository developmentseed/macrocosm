'use strict';
/*
 * Model for Relations
 *
 * Schema http://chrisnatali.github.io/osm_notes/osm_schema.html#relation_tags
 *
 */

var RelationTag = {

  tableName: 'current_relation_tags',
  attributes: {
    relation_id: {
      type: 'integer',
      model: 'Relation'
    },
    k: {
      type: 'string',
      truthy: true
    },
    v: {
      type: 'string',
      truthy: true
    }
  },
};

module.exports = RelationTag;
