'use strict';
var _ = require('lodash');

var newNode = function(attributes) {
  var entity = {
    lat: 10,
    lon: 10,
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

newNode.prototype.id = function(x) {
  if (x) {
    this.entity.id = x;
    return this
  }
  else return this.entity.id;
}

newNode.prototype.tags = function(x) {
  if (x) {
    if (!this.entity.tag) {
      this.entity.tag = [];
    }
    this.entity.tag.push(x);
    return this
  }
  else return this.entity.tag;
}

newNode.prototype.get = function() {
  return this.entity;
}

module.exports = newNode;
