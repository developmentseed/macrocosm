'use strict';
var knex = require('../../../connection');
var server = require('../../bootstrap.test');

module.exports.createGet = function createGet(base) {
  return function(url) {
    return server.injectThen({
      method: 'GET',
      url: base + url
    });
  }
};

module.exports.testChangeset = function testChangeset(uid, user, comment) {
  this.changesetId = null;

  this.payload = {
    uid: uid || 99,
    user: user || 'openroads',
    comment: comment || 'test comment',
    osm: {changeset: {}}
  };

  this.create = function create() {
    var _self = this;
    return server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: _self.payload
    })
    .then(function (res) {
      res.statusCode.should.eql(200);
      var id = +res.payload;
      id.should.be.within(0, Number.MAX_VALUE);
      _self.changesetId = id;
      return id;
    });
  };

  this.upload = function upload(data) {
    if (this.changesetId === null) {
      throw new Error('The changeset was not created yet.');
    }

    return server.injectThen({
      method: 'POST',
      url: '/changeset/' + this.changesetId + '/upload',
      payload: {
        osmChange: data
      }
    })
    .then(function(res) {
      res.statusCode.should.eql(200);
      return res;
    });
  };

  this.remove = function remove() {
    var _self = this;
    if (this.changesetId === null) {
      throw new Error('The changeset was not created yet.');
    }

    return knex.transaction(function(transaction) {
      var nodeIds = knex.select('id')
        .from('current_nodes')
        .where('changeset_id', _self.changesetId);

      var wayIds = knex.select('id')
        .from('current_ways')
        .where('changeset_id', _self.changesetId);

      var relationIds = knex.select('id')
        .from('current_relations')
        .where('changeset_id', _self.changesetId);

      return transaction('current_way_nodes')
        .whereIn('node_id', nodeIds)
        .orWhereIn('way_id', wayIds)
        .del()
        .returning('*')
        .then(function(deleted) {
          console.log(deleted.length, 'way nodes deleted');
          return transaction('current_way_tags').whereIn('way_id', wayIds).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'way tags deleted');
          return transaction('current_node_tags').whereIn('node_id', nodeIds).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'node tags deleted');
          return transaction('current_relation_tags').whereIn('relation_id', relationIds).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'relation tags deleted');
          return transaction('current_relation_members').whereIn('relation_id', relationIds).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'relation members deleted');
          return transaction('current_ways').where('changeset_id', _self.changesetId).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'nodes deleted');
          return transaction('current_nodes').where('changeset_id', _self.changesetId).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'ways deleted');
          return transaction('current_relations').where('changeset_id', _self.changesetId).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'relations deleted');
          return transaction('changesets').where('id', _self.changesetId).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'changesets deleted');
        });
    });
  };
}
