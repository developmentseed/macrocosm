'use strict';

var _ = require('lodash');
var ratio = require('./ratio.js');
var maxArea = require('./max-area.js');

var nullLatLon = [null,null,null,null];
var lonLimit = 180.0;
var latLimit = 90.0;

var log = require('./log');

// In OSM, the order goes min_lon, min_lat, max_lon, max_lat.
// All bounding box checks assume the input is unscaled.
function Bbox(minMaxLatLon) {

  var bounds = _.map(minMaxLatLon, parseFloat);

  // Check that coordinates exist and are numbers
  // Check that the min/max makes sense
  if (!isValidBounds(bounds)) {
    this.logError('Latitude/longitude bounds must be valid coordinates.');
  }
  else if (bounds[0] > bounds[2] && bounds[0] !== bounds[2]) {
    this.logError('The minimum longitude must be less than the maximum, but is not.');
  }
  else if (bounds[1] > bounds[3] && bounds[1] !== bounds[3]) {
    this.logError('The minimum latitude must be less than the maximum, but is not.');
  }
  else if (bounds[0] < -lonLimit ||
      bounds[1] < -latLimit ||
      bounds[2] > +lonLimit ||
      bounds[3] > +latLimit) {
    this.logError('Latitudes and longitudes are not within bounds.');
  }
  else if ((bounds[2] - bounds[0]) * (bounds[3] - bounds[1]) > maxArea) {
    this.logError('Request area is greater than maximum request area.');
  }
  else {
    this.error = null;
  }

  if (this.error) {
    log.error(this.error.toUpperCase());
    log.error('Setting bounding box to null values');
    bounds = nullLatLon;
  }

  this.minLon = bounds[0];
  this.minLat = bounds[1];
  this.maxLon = bounds[2];
  this.maxLat = bounds[3];
  return this;
}

Bbox.prototype.logError = function(msg) {
  this.error = msg;
}

Bbox.prototype.area = function() {
  return (this.maxLon - this.minLon) * (this.maxLat - this.minLat);
}

Bbox.prototype.centerLon = function() {
  return (this.minLon + this.maxLon) / 2.0;
}

Bbox.prototype.centerLat = function() {
  return (this.minLat + this.maxLat) / 2.0;
}

Bbox.prototype.width = function() {
  return this.maxLon - this.minLon;
}

Bbox.prototype.height = function() {
  return this.maxLat - this.minLat;
}

Bbox.prototype.toArray = function() {
  return [this.minLon, this.minLat, this.maxLon, this.maxLat];
}

Bbox.prototype.toObject = function () {
  return _.extend({}, {
    min_lon: this.minLon,
    min_lat: this.minLat,
    max_lon: this.maxLon,
    max_lat: this.maxLat
  });
}

Bbox.prototype.toString = function() {
  return this.toArray().join(',');
}

Bbox.prototype.toScaled = function() {
  this.minLon *= ratio;
  this.minLat *= ratio;
  this.maxLon *= ratio;
  this.maxLat *= ratio;
  return this;
}

function isValidBounds(bounds) {
  if (bounds.length !== 4) return false;
  for(var i = 0; i < 4; ++i) {
    var coord = bounds[i];
    if (typeof coord === 'undefined' || isNaN(coord)) {
      return false;
    }
  }
  return true;
}

var getBbox = {
  fromCoordinates: function(coordinates) {
    if (_.every(coordinates, function(coordinate) {
      return coordinate && !isNaN(coordinate);
    })) {
      return new Bbox(coordinates);
    }
    else {
      return new Bbox(nullLatLon);
    }
  },
  fromScaledActions: function(actions) {
    var lat = [];
    var lon = [];
    var nodes = _.filter(actions, function(action) {
      return action.model === 'node';
    });
    for(var i = 0, ii = nodes.length; i < ii; ++i) {
      var attributes = nodes[i].attributes;
      lon.push(parseFloat(attributes.longitude));
      lat.push(parseFloat(attributes.latitude));
    }
    return new Bbox([
      _.min(lon) / ratio,
      _.min(lat) / ratio,
      _.max(lon) / ratio,
      _.max(lat) / ratio
    ]);
  },
  fromNodes: function(nodes) {
    var lat = [];
    var lon = [];
    for(var i = 0, ii = nodes.length; i < ii; ++i) {
      var node = nodes[i];
      lon.push(parseFloat(node.lon));
      lat.push(parseFloat(node.lat));
    }
    return new Bbox([ _.min(lon), _.min(lat), _.max(lon), _.max(lat) ]);
  },
  fromChangeset: function (cs) {
    return new Bbox([cs.min_lon, cs.min_lat, cs.max_lon, cs.max_lat]);
  }
};

module.exports = getBbox;
