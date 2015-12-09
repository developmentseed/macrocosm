'use strict';
var knex = require('../../connection.js');

var changesets = [];

describe('changeset create endpoint', function () {
  after(function (done) {
    // Delete newly created changesets.
    knex.transaction(function(transaction) {
      return transaction('changesets').whereIn('id', changesets).del().returning('*')
        .then(function(deleted) {
          console.log(deleted.length, 'changesets deleted');
          return transaction('users').whereIn('id', [99, 1337]).del().returning('*');
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
        comment: 'test comment'
      }
    })
    .then(function (res) {
      res.statusCode.should.eql(200);
      var result = JSON.parse(res.payload);
      result.id.should.be.within(0, Number.MAX_VALUE);
      changesets.push(result.id);
      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });

  it('creates a user with the given id if one does not exist', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: 1337,
        user: 'openroads test user',
        comment: 'test comment'
      }
    })
    .then(function (res) {
      res.statusCode.should.eql(200);
      var result = JSON.parse(res.payload);
      result.id.should.be.within(0, Number.MAX_VALUE);
      changesets.push(result.id);
      done();
    })
    .catch(function (err) {
      return done(err);
    });

  });

});
