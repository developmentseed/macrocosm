/**
 * NodeTag.js
 *
 */

module.exports = {
  tableName: 'current_node_tags',

  attributes: {
    node_id: {
      type: 'integer',
      primaryKey: true,
      model: 'nodes'
    },
    k: {
      type: 'string',
      truthy: true
    },
    v: {
      type: 'string',
      truthy: true
    },
  }
};
