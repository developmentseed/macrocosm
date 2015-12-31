'use strict';
var libxml = require('libxmljs');
var _ = require('lodash');
var RATIO = require('./ratio');

var log = require('../services/log.js');
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
      bbox = obj.bbox;

    var doc = xml.writeDoc();
    var root = doc.root();

    if (bbox) {
      xml.writebbox(bbox, root);
    }

    if (nodes) {
      xml.writeNodes(nodes, root);
    }

    if (ways) {
      xml.writeWays(ways, root);
    }

    if (relations) {
      xml.writeRelations(relations, root);
    }

    return doc;
  },

  writeDoc: function() {
    var doc = new libxml.Document();
    doc.node('osm').attr({ version: 0.6, generator: 'DevelopmentSeed' });
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

      // Use the sequence ID to make sure nodes are ordered correctly.
      var wayNodes = way.nodes;
      var ordered = [];
      for (var j = 0, jj = wayNodes.length; j < jj; ++j) {
        var wayNode = wayNodes[j];
        ordered[parseInt(wayNode.sequence_id, 10)] = wayNode.node_id;
      }

      // Attach a node ref for each node, as long as it exists and it's id isn't '0'.
      for (var k = 0, kk = ordered.length; k < kk; ++k) {
        var wayNode = ordered[k];
        if (wayNode && wayNode !== '0') {
          wayEl.node('nd').attr({ ref: wayNode });
        }
      }

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

      // Use the sequence ID to make sure members are ordered correctly.
      var members = relation.members;
      var ordered = [];
      for (var j = 0, jj = members.length; j < jj; ++j) {
        var member = members[j];
        ordered[parseInt(member.sequence_id, 10)] = member;
      }

      // Attach members that exist.
      for (var k = 0, kk = ordered.length; k < kk; ++k) {
        var member = ordered[k];
        if (member) {
          relationEl.node('member').attr({
            type: member.member_type.toLowerCase(),
            ref: member.member_id,
            role: member.member_role
          });
        }
      }

      // Attach relation tags.
      var tags = relation.tags;
      if (tags && _.isArray(tags) && tags.length) {
        for (var m = 0, mm = tags.length; m < mm; ++m) {
          var tag = tags[m];
          relationEl.node('tag').attr({ k: tag.k, v: tag.v });
        }
      }
    }
  }
};

module.exports = xml;

