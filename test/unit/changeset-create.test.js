'use strict';
var knex = require('../../connection.js');
var server = require('../bootstrap.test');

var changesets = [];

describe('changeset create endpoint', function () {
  after(function (done) {
    // Delete newly created changesets.
    knex.transaction(function(transaction) {
      console.log(changesets);
      return transaction('changesets').whereIn('id', changesets).del().returning('*')
        .then(function(deleted) {
          console.log(deleted.length, 'changesets deleted');
          return transaction('users').whereIn('id', [99]).del().returning('*');
        })
        .then(function(deleted) {
          console.log(deleted.length, 'users deleted');
        })
    })
    .then(function() {
      return done();
    })
    .catch(done);
  });

  it('returns a numerical changeset id.', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: 99,
        user: 'openroads',
        comment: 'test comment',
        osm: {changeset: {}}
      }
    })
    .then(function (res) {
      res.statusCode.should.eql(200);
      var id = +res.payload;
      (id).should.be.within(0, Number.MAX_VALUE);
      changesets.push(id);
      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });
});
