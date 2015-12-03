'use strict';

var fs = require('fs');
var libxml = require('libxmljs');

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
    var expected = '<?xml version="1.0" encoding="UTF-8"?>\n<osm version="6" generator="DevelopmentSeed">\n  <bounds minlat="-0.1" minlon="-0.1" maxlat="0.1" maxlon="0.1"/>\n</osm>\n';

    server.injectThen(request('-0.1,-0.1,0.1,0.1'))
    .then(function (res) {
      res.statusCode.should.equal(200);
      res.payload.should.equal(expected);

      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });
});
