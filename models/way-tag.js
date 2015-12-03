/**
 * WayTag.js
 *
 */

module.exports = {

  tableName: 'current_way_tags',

  attributes: {
    way_id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      model: 'ways'
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
