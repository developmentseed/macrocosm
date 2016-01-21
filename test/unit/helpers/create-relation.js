'use strict';
var _ = require('lodash');

function toArray(val) {
  if (_.isArray(val)) {
    return val;
  }
  return [val];
}

var newRelation = function(attributes) {
  var entity = {
    version: 0,
    id: -1,
    changeset: 1,
    timestamp: new Date()
  };
  if (attributes) {
    entity = _.extend({}, entity, attributes);
  }
  this.entity = entity;
  return this;
}

newRelation.prototype.id = function(x) {
  if (x) {
    this.entity.id = x;
    return this
  }
  else return this.entity.id;
}

newRelation.prototype.tags = function(x) {
  if (x) {
    if (!this.entity.tag) {
      this.entity.tag = [];
    }
    this.entity.tag.push(x);
    return this
  }
  else return this.entity.tag;
}

newRelation.prototype.members = function(type, x) {
  var members = toArray(x).map(function(member) {
    return { type: type, ref: member.id() }
  });
  if (!this.entity.member) {
    this.entity.member = [];
  }
  this.entity.member = this.entity.member.concat(members);
  return this;
}

newRelation.prototype.get = function() {
  return this.entity;
}

module.exports = newRelation;
