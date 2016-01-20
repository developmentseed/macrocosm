'use strict';

var parser = require('xml2json');

var server = require('../bootstrap.test');

function request (bbox) {
  return {
    method: 'GET',
    url: '/xml/map?bbox='+bbox
  };
}

describe('map endpoint', function () {

  it('fails without valid bbox parameter', function (done) {
    server.injectThen(request('0,0,1'))
    .then(function (res) {
      res.statusCode.should.not.eql(200);
      var result = JSON.parse(res.payload);
      result.message.should
        .equal('Latitude/longitude bounds must be valid coordinates.');
      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });

  it('succeeds with valid bbox parameter', function (done) {
    server.injectThen(request('0,0,0.1,0.1'))
    .then(function (res) {
      res.statusCode.should.equal(200);
      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });

  it('yields an empty response when the given bounding box is empty',
  function (done) {
    server.injectThen(request('-0.1,-0.1,0.1,0.1'))
    .then(function (res) {
      res.statusCode.should.equal(200);
      var _res = parser.toJson(res.payload, {
        arrayNotation: true,
        object: true
      });
      _res.osm.should.have.length(1);
      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });
});
