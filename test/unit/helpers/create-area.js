'use strict';
var _ = require('lodash');
var Way = require('./create-way');

var newArea = function (attributes) {
  var entity = {
    version: 0,
    id: -1,
    changeset: 1,
    tag: [{
      k: 'area',
      v: true
    }]
  };
  if (attributes) {
    entity = _.extend({}, entity, attributes);
  }
  this.entity = entity;
  return this;
}

_.extend(newArea.prototype, Way.prototype, {
  nodes: function (x) {
    if (x) {
      this.entity.nd = x.map(function(node) {
        return { ref: node.id() }
      });
      this.entity.nd.push({ ref: x[0].id() });
      return this;
    }
    else return this.entity.nd;
  }
});

module.exports = newArea;
