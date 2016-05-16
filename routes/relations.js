'use strict';
var Boom = require('boom');
var knex = require('../connection.js');

module.exports = [
  /**
   * @api {get} /relations/:id Get relation by ID
   * @apiGroup Features
   * @apiName GetRelation
   * @apiVersion 0.1.0
   *
   * @apiParam {Number} id Relation ID.
   *
   * @apiSuccess {Object} relation Relation
   * @apiSuccess {String} relation.id     Relation id.
   * @apiSuccess {String} relation.timestamp   Relation creation date.
   * @apiSuccess {String} relation.visible   Whether entity can be rendered.
   * @apiSuccess {Object[]} relation.tags   Tags associated to this relation.
   * @apiSuccess {Object[]} relation.members   List of members belonging to this relation
   * @apiSuccess {Object} relation.members.relation_id  ID of relation
   * @apiSuccess {Object} relation.members.relation_type  Type of member (Way or Node)
   * @apiSuccess {Object} relation.members.member_id  ID of member
   * @apiSuccess {Object} relation.members.member_role  Member role
   * @apiSuccess {Object} relation.members.sequence_id  Order of member within relation
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/relations/260
   *
   * @apiSuccessExample {json} Success-Response:
   *  [
   *    {
   *    "id": "260",
   *    "changeset_id": "1",
   *    "timestamp": "2015-04-21T17:31:51.105Z",
   *    "visible": true,
   *    "version": "1",
   *    "tags": [{
   *      "relation_id": "260",
   *      "k": "test",
   *      "v": "relation_endpoint"
   *      }],
   *    "members": [
   *    {
   *      "relation_id": "260",
   *      "member_type": "Node",
   *      "member_id": "698236",
   *      "member_role": " ",
   *      "sequence_id": 0
   *     },
   *    ...
   *    ]
   *  }]
   */
  {
    method: 'GET',
    path: '/relations/{id}',
    handler: function (req, res) {
      if(!req.params.id) {
        return res(Boom.badRequest('Valid relation id required.'));
      }

      queryRelations([req.params.id], true)
      .then(res);
    }
  },
  /**
   * @api {get} /relations?key1=value1&key2=value2 Query relations by tag
   * @apiGroup Features
   * @apiName GetRelations
   * @apiDescription Get relations that either belong to a way, or are
   * tagged with an attribute.
   * @apiVersion 0.1.0
   *
   * @apiParam (Querying by way ID) {String} member member=WayID eg. member=32
   * @apiParam (Querying by tag) {String} tag_name tag=value eg. road_condition=poor
   *
   * @apiSuccess {Object[]} relations      List of relations
   * @apiSuccess {String} relations.id     Relation id.
   * @apiSuccess {String} relations.timestamp   Relation creation date.
   * @apiSuccess {String} relations.visible   Whether entity can be rendered.
   * @apiSuccess {Object[]} relations.tags   Tags associated to this relation.
   *
   * @apiExample {curl} Querying by member:
   *    curl http://localhost:4000/relations?member=168329
   * @apiExample {curl} Querying by tag:
   *    curl http://localhost:4000/relations?test=relation_endpoint
   *
   * @apiSuccessExample {json} Success-Response:
   *  [
   *    {
   *      "id": "260",
   *      "changeset_id": "1",
   *      "timestamp": "2015-04-21T17:31:51.105Z",
   *      "visible": true,
   *      "version": "1",
   *      "tags": [
   *      {
   *        "relation_id": "260",
   *        "k": "test",
   *        "v": "relation_endpoint"
   *      }]
   *    }
   *  ]
   */
  {
    method: 'GET',
    path: '/relations',
    handler: function (req, res) {

      var query = req.query;

      var q;
      // Query the relation by it's member iD.
      // This asks, what projects is this road a part of?
      if (query.member) {
        q = knex('current_relation_members')
        .where('member_type', 'Way')
        .andWhere('member_id', +query.member)
        .select('relation_id');

      }

      // Query the relation by the type of tag it has.
      else {
        var tagKeys = Object.keys(query);
        if(tagKeys.length === 0) {
          return res(Boom.badRequest('Relations endpoint needs member or tags.'));
        }

        q = knex('current_relation_tags');
        tagKeys.forEach(function(key) {
          q = q.where(function () {
            this
            .where('k', key)
            .andWhere('v', query[key]);
          });
        });
        q = q.select('relation_id');
      }
      queryRelations(q).then(res);

    }

  }];

function queryRelations(relationIds, full) {
  return knex('current_relations')
    .whereIn('id', relationIds)
    .then(function (rels) {
      return Promise.all([
        knex('current_relation_tags')
          .whereIn('relation_id', relationIds),
        full ? knex('current_relation_members')
          .whereIn('relation_id', relationIds) : []
      ])
      .then(function (result) {
        var tags = result[0];
        var members = result[1];
        rels.forEach(function (rel) {
          rel.tags = tags.filter(function (t) {
            return t.relation_id === rel.id;
          });
          if(full) {
            rel.members = members.filter(function (m) {
              return m.relation_id === rel.id;
            });
          }
        });
        return rels;
      });
    });
}
