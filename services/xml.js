'use strict';

var util = require('util');

var libxml = require('libxmljs');
var _ = require('lodash');

var meta = require('../package.json');

var GENERATOR = util.format('%s (v%s)', meta.name, meta.version);
var RATIO = require('./ratio');

var Node = require('../models/node-model.js');
var Way = require('../models/way.js');

var xml = {

  read: function(xmlString) {

    var result = {
      create: {},
      modify: {},
      delete: {}
    };

    var models = {
      node: Node,
      way: Way
    };

    try {
      var doc = libxml.parseXmlString(xmlString);
    }
    catch (err) {
      throw new Error(err) ;
    }

    // insert, modify, destroy
    var actions = doc.childNodes();

    actions.forEach(function(action) {
      var name = action.name();
      var entityResult = result[name];

      if (!entityResult) {
        return;
      }

      var entities = action.childNodes();
      for (var i = 0, ii = entities.length; i < ii; ++i) {
        var entity = entities[i];

        // node, way, creation
        var type = entity.name();
        if (!entityResult[type]) {
          entityResult[type] = [];
        }

        var model = models[type];
        if (model) {
          entityResult[type].push(model.fromOSM(entity));
        }
      }
    });

    return result;
  },

  write: function(obj) {
    var obj = obj || {},
      nodes = obj.nodes,
      ways = obj.ways,
      relations = obj.relations,
      bbox = obj.bbox,
      changesets = obj.changesets;

    var doc = xml.writeDoc();
    var root = doc.root();

    if (bbox) { xml.writebbox(bbox, root); }
    if (nodes) { xml.writeNodes(nodes, root); }
    if (ways) { xml.writeWays(ways, root); }
    if (relations) { xml.writeRelations(relations, root); }
    if (changesets) { xml.writeChangesets(changesets, root); }

    return doc;
  },

  writeDoc: function() {
    var doc = new libxml.Document();
    doc.node('osm').attr({ version: 0.6, generator: GENERATOR });
    return doc;
  },

  writebbox: function(bbox, root) {
    root.node('bounds').attr({
      minlat: bbox.minLat,
      minlon: bbox.minLon,
      maxlat: bbox.maxLat,
      maxlon: bbox.maxLon
    });
  },

  writeNodes: function(nodes, root) {

    for (var i = 0, ii = nodes.length; i < ii; ++i) {
      var node = nodes[i];
      var nodeEl = root.node('node').attr({
        id: node.id,
        visible: node.visible,
        version: node.version,
        changeset: node.changeset_id,
        timestamp: node.timestamp.toISOString(),
        user: 'DevelopmentSeed',
        uid: 1,
        lat: node.latitude / RATIO,
        lon: node.longitude / RATIO
      });

      // attach tags
      var tags = node.tags;
      if (tags && _.isArray(tags) && tags.length) {
        for (var m = 0, mm = tags.length; m < mm; ++m) {
          var tag = tags[m];
          nodeEl.node('tag').attr({ k: tag.k, v: tag.v });
        }
      }
    }
  },

  writeWays: function(ways, root) {
    for (var i = 0, ii = ways.length; i < ii; ++i) {
      var way = ways[i];
      var wayEl = root.node('way').attr({
        id: way.id,
        visible: way.visible,
        version: way.version,
        changeset: way.changeset_id,
        timestamp: way.timestamp.toISOString(),
        user: 'DevelopmentSeed',
        uid: 1
      });

      way.nodes.forEach(function(nd) {
        wayEl.node('nd').attr({
          ref: nd.id
        });
      });

      // Attach way tags
      var tags = way.tags;
      if (tags && _.isArray(tags) && tags.length) {
        for (var m = 0, mm = tags.length; m < mm; ++m) {
          var tag = tags[m];
          wayEl.node('tag').attr({ k: tag.k, v: tag.v });
        }
      }
    }
  },

  writeRelations: function(relations, root) {
    for (var i = 0, ii = relations.length; i < ii; ++i) {
      var relation = relations[i];
      var relationEl = root.node('relation').attr({
        id: relation.id,
        visible: relation.visible,
        version: relation.version,
        changeset: relation.changeset_id,
        timestamp: relation.timestamp.toISOString(),
        user: 'DevelopmentSeed',
        uid: 1
      });

      relation.members.forEach(function(member) {
        relationEl.node('member').attr({
          type: member.member_type.toLowerCase(),
          ref: member.member_id,
          role: member.member_role
        });
      });

      // Attach relation tags.
      var tags = relation.tags;
      if (tags && _.isArray(tags) && tags.length) {
        for (var m = 0, mm = tags.length; m < mm; ++m) {
          var tag = tags[m];
          relationEl.node('tag').attr({ k: tag.k, v: tag.v });
        }
      }
    }
  },

  writeChangesets: function (changesets, root) {
    if (!_.isArray(changesets)) {
      changesets = [changesets];
    }
    changesets.forEach(function (changeset) {
      var attributes = _.omit(changeset, 'tags');
      var el = root.node('changeset').attr(attributes);
      changeset.tags.forEach(function (tag) {
        el.node('tag').attr(tag);
      });
    });
  }
};

module.exports = xml;
