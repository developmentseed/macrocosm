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
          return transaction('users').where('id', '9999').del().returning('*');
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

  it('creates a new user if id nonexistant and returns a numerical changeset id', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: 9999,
        user: 'rolling jack',
        comment: 'this is a test comment'
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
