'use strict';
var _ = require('lodash');
var knex = require('../../connection.js');
var mocks = require('./fixtures/changesets.js');
var XML = require('../../services/xml.js');
var log = require('../../services/log.js');

var Node = require('./helpers/create-node.js');
var Way = require('./helpers/create-way.js');
var Relation = require('./helpers/create-relation.js');
var Change = require('./helpers/create-changeset.js');
var Area = require('./helpers/create-area');
var serverTest = require('./helpers/server-test');

var testChangeset = new serverTest.testChangeset();
// Changeset Id. Shortcut for easy access.
var cid = null;

function makeNodes(changesetId, ii) {
  var nodes = [];
  for (var i = 0; i < ii; ++i) {
    nodes.push(new Node({ id: -(i+1), changeset: changesetId }));
  }
  return nodes;
}

describe('Area helper functions', function () {
  it('Test helper creates properly formed areas', function () {
    var nodes = makeNodes(1, 10);
    var area = new Area().nodes(nodes);
    var nd = area.entity.nd;
    // Length of node references is one more than total existant nodes
    nd.should.have.lengthOf(11);
    // Last node should be first node
    nd[0].ref.should.equal(nd[nd.length-1].ref);
    // Should have key/value of area: true
    area.entity.tag[0].k.should.equal('area');
    area.entity.tag[0].v.should.equal(true);
  });
});

describe('changeset upload endpoint', function() {
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
        cid = changesetId;
        return done();
      })
      .catch(done);
  });

  var cs = new Change();

  beforeEach(function() {
    cs.wipe();
  });

  it('Creates 1 node', function(done) {
    cs.create('node', new Node({changeset: cid}));
    testChangeset.upload(cs.get())
      .then(function(res) { return done(); })
      .catch(done);
  });

  it('Creates 500 nodes', function(done) {
    var nodes = makeNodes(cid, 500);
    cs.create('node', nodes);
    testChangeset.upload(cs.get())
      .then(function(res) { return done(); })
      .catch(done);
  });

  it('Creates 1 node and 1 node tag', function(done) {
    cs.create('node', new Node({changeset: cid}).tags({k: 'howdy', v: 'test'}));
    testChangeset.upload(cs.get())
      .then(function(res) { return done(); })
      .catch(done);
  });

  it('Creates 1 way with 500 nodes and 50 tags', function(done) {
    var nodes = makeNodes(cid, 500);
    var way = new Way({changeset: cid}).nodes(nodes);
    for (var i = 0; i < 50; ++i) {
      way.tags({ k: 'happy' + i, v: 'testing' + i });
    }
    cs.create('node', nodes).create('way', way);
    testChangeset.upload(cs.get())
      .then(function(res) { return done(); })
      .catch(done);
  });

  it('Creates 5 ways with 500 nodes', function(done) {
    var nodes = makeNodes(cid, 500);
    var ways = [
      new Way({ id: -1, changeset: cid }).nodes(nodes.slice(0,100)),
      new Way({ id: -2, changeset: cid }).nodes(nodes.slice(101,200)),
      new Way({ id: -3, changeset: cid }).nodes(nodes.slice(201,300)),
      new Way({ id: -4, changeset: cid }).nodes(nodes.slice(301,400)),
      new Way({ id: -5, changeset: cid }).nodes(nodes.slice(401,499))
    ];
    cs.create('node', nodes).create('way', ways);
    testChangeset.upload(cs.get())
      .then(function(res) { return done(); })
      .catch(done);
  });

  it('Creates 5 nodes, 1 way, and 1 relation', function(done) {
    var nodes = makeNodes(cid, 5);
    var way = new Way({changeset: cid}).nodes(nodes);
    var relation = new Relation({changeset: cid}).members('node', nodes).members('way', way);
    cs.create('node', nodes).create('way', way).create('relation', relation);
    testChangeset.upload(cs.get())
      .then(function(res) { return done(); })
      .catch(done);
  });

  it('Modifies 1 node', function(done) {
    knex('current_nodes').where('changeset_id', cid).then(function(nodes) {
      nodes[0].changeset = cid;
      cs.modify('node', new Node(nodes[0]));
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Modifies up to 50 nodes', function(done) {
    knex('current_nodes').where('changeset_id', cid).then(function(nodes) {
      var newNodes = [];
      var modified = 0;
      nodes = nodes.slice(0,50);
      nodes.forEach(function(node) {
        if (node) {
          node.changeset = cid;
          modified += 1;
          newNodes.push(new Node(node));
        }
      });
      log.info('Modifying ' + modified + ' nodes');
      cs.modify('node', newNodes);
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Creates 500 nodes, Modifies a way with 500 nodes', function(done) {
    knex('current_ways').where('changeset_id', cid).then(function(ways) {
      var nodes = makeNodes(cid, 500);
      ways[0].changeset = cid;
      var way = new Way(ways[0]).nodes(nodes);
      cs.create('node', nodes).modify('way', way);
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Creates 500 nodes, modifies up to 10 ways', function(done) {
    knex('current_ways').where('changeset_id', cid).then(function(ways) {
      ways = ways.slice(0,10);
      var nodes = makeNodes(cid, 500);
      var newWays = [];
      var modified = 0;
      ways.forEach(function(way) {
        if (way) {
          modified += 1;
          way.changeset = cid;
          newWays.push(new Way(way).nodes(nodes));
        }
      });
      log.info('Modifying ' + modified + ' ways');
      cs.create('node', nodes).modify('way', newWays);
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Modifies a relation', function(done) {
    knex('current_relations').where('changeset_id', cid).then(function(relations) {
      var nodes = makeNodes(cid, 150);
      var relation = new Relation({ id: relations[0].id, changeset: cid}).members('node', nodes);
      cs.create('node', nodes).modify('relation', relation);
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Deletes 1 node', function(done) {
    knex('current_nodes').where('changeset_id', cid).then(function(nodes) {
      cs.delete('node', new Node(nodes[0]));
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Deletes 1 way', function(done) {
    knex('current_ways').where('changeset_id', cid).then(function(ways) {
      cs.delete('node', new Way(ways[0]));
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Deletes up to 500 nodes', function(done) {
    knex('current_nodes').where('changeset_id', cid).then(function(nodes) {
      nodes = nodes.slice(0, 500);
      cs.delete('node', nodes);
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Deletes 1 relation', function(done) {
    knex('current_relations').where('changeset_id', cid).then(function(relations) {
      relations = relations[0];
      cs.delete('relation', relations);
      testChangeset.upload(cs.get())
        .then(function(res) { return done(); })
        .catch(done);
    });
  });

  it('Increments the number of changes', function(done) {
    knex('changesets').where('id', cid).then(function(changeset) {
      var nodes = makeNodes(cid, 15);
      var way = new Way({changeset: cid}).nodes(nodes);
      var relation = new Relation({changeset: cid}).members('node', nodes);
      cs.create('node', nodes);
      cs.create('way', way);
      cs.create('relation', relation);

      testChangeset.upload(cs.get())
        .then(function(res) {
          var oldChanges = changeset[0].num_changes;
          var newChanges = res.result.changeset.num_changes;
          (newChanges).should.be.equal(oldChanges + 15 + 1 + 1);
          done();
        })
        .catch(done);
    });
  });

  it('Returns the modified IDs of newly-created elements', function(done) {
    var nodes = makeNodes(cid, 3);
    var way = new Way({changeset: cid}).nodes(nodes);
    var relation = new Relation({changeset: cid}).members('node', nodes);
    cs.create('node', nodes);
    cs.create('way', way);
    cs.create('relation', relation);

    testChangeset.upload(cs.get())
      .then(function(res) {
        var created = res.result.created;
        created.node.should.have.property('-3');
        created.way.should.have.property('-1');
        created.relation.should.have.property('-1');
        done();
      })
      .catch(done);
  });
});
