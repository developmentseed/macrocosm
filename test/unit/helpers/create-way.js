'use strict';
var _ = require('lodash');

var newWay = function(attributes) {
  var entity = {
    version: 0,
    id: -1,
    changeset: 1
  };
  if (attributes) {
    entity = _.extend({}, entity, attributes);
  }
  this.entity = entity;
  return this;
}

newWay.prototype.id = function(x) {
  if (x) {
    this.entity.id = x;
    return this
  }
  else return this.entity.id;
}

newWay.prototype.tags = function(x) {
  if (x) {
    if (!this.entity.tag) {
      this.entity.tag = [];
    }
    this.entity.tag.push(x);
    return this
  }
  else return this.entity.tag;
}

newWay.prototype.nodes = function(x) {
  if (x) {
    this.entity.nd = x.map(function(node) {
      return { ref: node.id() }
    });
    return this;
  }
  else return this.entity.nd;
}

newWay.prototype.get = function() {
  return this.entity;
}

module.exports = newWay;
