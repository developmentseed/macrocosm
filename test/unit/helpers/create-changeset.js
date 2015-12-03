'use strict';
var _ = require('lodash');

function toArray(val) {
  if (_.isArray(val)) {
    return val;
  }
  return [val];
}

function parse(entities) {
  return toArray(entities).map(function(entity) {
    if (entity.get) {
      return entity.get();
    }
    else return entity
  })
}

var newChange = function(obj) {
  var change = {
    create: {},
    modify: {},
    delete: {}
  };

  this.change = change;
  return this;
}

newChange.prototype.create = function(type, entities) {
  entities = parse(entities);
  if (this.change.create[type] && this.change.create[type].length) {
    this.change.create[type] = this.change.create[type].concat(entities);
  }
  else this.change.create[type] = entities;
  return this;
}

newChange.prototype.modify = function(type, entities) {
  entities = parse(entities);
  if (this.change.modify[type] && this.change.modify[type].length) {
    this.change.modify[type] = this.change.modify[type].concat(entities);
  }
  else this.change.modify[type] = entities;
  return this;
}

newChange.prototype.delete = function(type, entities) {
  entities = parse(entities);
  if (this.change.delete[type] && this.change.delete[type].length) {
    this.change.delete[type] = this.change.delete[type].concat(entities);
  }
  else this.change.delete[type] = entities;
  return this;
}

newChange.prototype.get = function() {
  return this.change;
}

newChange.prototype.wipe = function() {
  this.change = {
    create: {},
    modify: {},
    delete: {}
  };
}

module.exports = newChange;
