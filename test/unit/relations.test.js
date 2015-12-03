'use strict';
var knex = require('../../connection.js');

var Node = require('./helpers/create-node.js');
var Way = require('./helpers/create-way.js');
var Relation = require('./helpers/create-relation.js');
var Change = require('./helpers/create-changeset.js');
var serverTest = require('./helpers/server-test');

var testChangeset = new serverTest.testChangeset();
var get = serverTest.createGet('/relations');

function makeNodes(changesetId, ii) {
  var nodes = [];
  for (var i = 0; i < ii; ++i) {
    nodes.push(new Node({ id: -(i+1), changeset: changesetId }));
  }
  return nodes;
}

describe('Relations endpoint', function() {
  // Save those relation and way IDs for id, member searches.
  var ids = {};

  after(function (done) {
    testChangeset.remove()
      .then(function () {
        return done();
      })
      .catch(done);
  });

  before('Create changeset', function (done) {
    testChangeset.create()
      .then(function (changesetId) {
          var cs = new Change();
          var nodes = makeNodes(changesetId, 5);
          var way = new Way({id: -1, changeset: changesetId}).nodes(nodes);
          var relation = new Relation({id: -1, changeset: changesetId})
            .members('node', nodes)
            .members('way', way)
            .tags({ k: 'test', v: 'relation_endpoint' });

          cs.create('node', nodes)
            .create('way', way)
            .create('relation', relation);

          testChangeset.upload(cs.get())
            .then(function(res) {
              ids.way = res.result.created.way['-1'];
              ids.relation = res.result.created.relation['-1'];
              return done();
            })
            .catch(done);
      })
      .catch(done);
  });

  it('Should return a valid relation, using a tag search', function(done) {
    get('?test=relation_endpoint').then(function(res) {
      res.statusCode.should.eql(200);
      var payload = JSON.parse(res.payload);
      payload[0].should.have.keys('changeset_id', 'tags', 'id', 'timestamp', 'version', 'visible');
      payload[0].tags.should.have.lengthOf(1);
      done();
    }).catch(done);
  });

  it('Should return a valid relation, using a member search', function(done) {
    knex('current_relation_members')
    .where('member_id', ids.way).andWhere('member_type', 'Way').then(function(member) {
      member = member[0];
      get('?member=' + member.member_id).then(function(res) {
        res.statusCode.should.eql(200);
        var payload = JSON.parse(res.payload);
        payload[0].should.have.keys('changeset_id', 'tags', 'id', 'timestamp', 'version', 'visible');
        (payload[0].id).should.equal(ids.relation);
        done();
      }).catch(done);
    });
  });

  it('Should return a valid relation, using a relation id', function(done) {
    get('/' + ids.relation).then(function(res) {
      res.statusCode.should.eql(200);
      var payload = JSON.parse(res.payload);
      payload[0].members.should.have.lengthOf(6);
      payload[0].should.have.keys('changeset_id', 'tags', 'id', 'timestamp', 'version', 'visible', 'members');
      payload[0].members.should.have.lengthOf(6);
      done();
    }).catch(done);
  });
});
