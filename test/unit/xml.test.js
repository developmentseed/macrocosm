'use strict';
var libxml = require('libxmljs');
require('should');
var XML = require('../../services/xml.js');

var jsonChangeset = require('./fixtures/xml-read.js').osmChange;
var xmlChangeset = require('./fixtures/xml-read.xml');
var taggedNode = require('./fixtures/node-with-tag.xml');

var Node = require('../../models/node-model.js');
var Way = require('../../models/way.js');

var mock = {
  Node: require('./helpers/create-node.js'),
  Way: require('./helpers/create-way.js'),
  Relation: require('./helpers/create-way.js')
};

function jsonRmTimes(entity) {
  entity.timestamp = '';
  return entity;
}

describe('XML', function() {
  describe('#read', function() {

    it('Encodes the right number of way nodes', function() {
      var parsed = XML.read(xmlChangeset);
      (parsed.modify.way[0].nd.length).should.eql(jsonChangeset.modify.way[0].nd.length);
    });

    it('Encodes the right number of tags', function() {
      var parsed = XML.read(xmlChangeset);
      (parsed.modify.way[0].tag.length).should.eql(jsonChangeset.modify.way[0].tag.length);
    });

    it('Encodes the proper tags', function() {
      var parsed = XML.read(taggedNode);
      (parsed.create.node[0].tag[0].v).should.eql('test');
    });

    it('Creates comparable nodes using Node#fromEntity', function() {
      var parsed = XML.read(xmlChangeset);
      var parsedNode = parsed.modify.node[0];
      var entity = Node.fromEntity(parsedNode);

      (jsonRmTimes(entity)).should.eql(
        jsonRmTimes(Node.fromEntity(jsonChangeset.modify.node[0])));
    });

    it('Creates comparable ways using Way#fromEntity', function() {
      var parsed = XML.read(xmlChangeset);
      var parsedWay = parsed.modify.way[0];
      var entity = Way.fromEntity(parsedWay);
      (jsonRmTimes (entity)).should.eql(
        jsonRmTimes(Way.fromEntity(jsonChangeset.modify.way[0])));
    });
  });

  describe('#write', function() {

    it('Should correctly write tags to nodes', function() {
      var node = new mock.Node({
        tags: [{ k: 1, v: 1 }]
      });
      var xml = XML.write({ nodes: [node.entity] }).toString();
      var doc = libxml.parseXmlString(xml);
      doc.get('//tag').toString().should.eql('<tag k="1" v="1"/>');
    });

    it('Should correctly write tags to ways', function() {
      var way = new mock.Way({
        tags: [{ k: 1, v: 1 }],
        nodes: []
      });
      var xml = XML.write({ ways: [way.entity] }).toString();
      var doc = libxml.parseXmlString(xml);
      doc.get('//tag').toString().should.eql('<tag k="1" v="1"/>');
    });

    it('Writes tags to relations', function() {
      var relation = new mock.Relation({
        tags: [{ k: 1, v: 1}],
        members: []
      });
      var xml = XML.write({ relations: [relation.entity] }).toString();
      var doc = libxml.parseXmlString(xml);
      doc.get('//tag').toString().should.eql('<tag k="1" v="1"/>');
    });

    it('Throws error if entity has no timestamp', function () {
      var node = { changeset: 1 };
      (function () {
        XML.write({ nodes: [node] });
      }).should.throw();
    });
  });
});
