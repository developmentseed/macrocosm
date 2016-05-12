'use strict';
var knex = require('../../connection');
var server = require('../bootstrap.test');
var libxml = require('libxmljs');
var Changeset = require('./helpers/create-changeset');
var should = require('should');

describe('changeset query endpoint', function () {

  it('queries on user and returns tags', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: 1,
        user: 'macrocosm',
        comment: 'test comment',
        osm: {changeset: new Changeset().getAttrs({
          tag: [
            { k: 'super', v: 'duper' },
          ]
        })}
      }
    })
    .then(function () {
      server.injectThen({
        method: 'GET',
        url: '/api/0.6/changesets?user=1'
      }).then(function (res) {
        res.statusCode.should.eql(200);
        var doc = libxml.parseXmlString(res.payload);
        should(doc.get('//changeset[@user="macrocosm"]')).ok;
        should(doc.get('//tag[@k="super"]')).ok;
        done();
      });
    });
  });

  it('queries on user when no tags present', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: 9,
        user: 'no-tag',
        comment: 'test comment',
        osm: {changeset: new Changeset().getAttrs({
          tag: []
        })}
      }
    })
    .then(function () {
      server.injectThen({
        method: 'GET',
        url: '/api/0.6/changesets?user=9'
      }).then(function (res) {
        res.statusCode.should.eql(200);
        var doc = libxml.parseXmlString(res.payload);
        var changeset = doc.get('//changeset[@user="no-tag"]');
        should(changeset).ok;
        should(changeset.get('//tag')).not.ok;
        done();
      });
    });
  });
});
