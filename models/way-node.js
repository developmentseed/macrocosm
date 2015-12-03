'use strict';
/**
* WayNode.js
*
* @description :: Represents relations between ways and nodes.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#way_nodes
*
*/

module.exports = {

  tableName: 'current_way_nodes',

  attributes: {
    way_id: {
      type: 'integer',
      primaryKey: true,
      numeric: true,
      model: 'ways'
    },
    sequence_id: {
      type: 'integer',
    },
    node_id: {
      type: 'integer',
      numeric: true,
      model: 'nodes'
    },
  }
};
