'use strict';

var Boom = require('boom');
var _ = require('lodash');
var knex = require('../connection');
var validateArray = require('../util/validate-array');
var log = require('../services/log');

function changesetCreate(req, res) {
  var now = new Date();
  var changeset = req.payload.osm.changeset;
  changeset.tag = validateArray(changeset.tag);
  var uid = req.payload.osm.uid || 1;
  var username = req.payload.osm.user || 'placeholder';

  knex('users')
    .where('id', uid)
    .then(function(users) {
      if (users.length > 0) {
        return uid;
      }
      return knex('users')
        .insert({
          id: uid,
          display_name: username,
          // TODO: we aren't using the following fields; they're just here to
          // cooperate w the database schema.
          email: uid + '@email.org',
          pass_crypt: '00000000000000000000000000000000',
          data_public: true,
          creation_time: new Date()
        });
    })

    .then(function () {
      // TODO do this in a transaction
      return knex('changesets')
      .returning('id')
      .insert({
        user_id: uid,
        created_at: now,
        closed_at: now,
        num_changes: 0
      })
    })

    .then(function(ids) {
      if (!ids.length) { throw new Error('Could not add changeset to database.'); }
      var id = ids[0];
      if (changeset.tag == null || changeset.tag.length === 0) { return id; }

      var tags = changeset.tag.map(function(tag) {
        return _.extend({}, tag, {
          changeset_id: id
        });
      });
      return knex('changeset_tags')
        .insert(tags)
        .then(function() {
          return id;
        });
    })

    .then(function(id) {
      return res(id).type('text/plain');
    })

    .catch(function (err) {
      log.error(err);
      return res(Boom.wrap(err));
    });
}

module.exports = [
  {
    /**
     * @api {put} /changeset/create Create a changeset
     * @apiGroup Changeset
     * @apiName CreateChangeset
     * @apiDescription Given a user and a user ID, create a new changeset and
     * return the newly created changeset ID.
     * @apiVersion 0.1.0
     *
     * @apiParam {Number} uid User ID
     * @apiParam {String} user User name
     *
     * @apiExample {curl} Example Usage:
     *    curl -X PUT --data "uid=1&user=john" http://localhost:4000/changeset/create
     *
     * @apiSuccessExample {Number} Success-Response:
     *  1194
     */
    method: 'PUT',
    path: '/changeset/create',
    handler: changesetCreate
  },
  {
    /**
     * @api {put} /api/0.6/changeset/create Create a changeset
     * @apiGroup Changeset
     * @apiName CreateChangeset06
     * @apiDescription Create a new changeset and return the newly created
     * changeset ID.
     *
     * @apiExample {xml} Payload
     *  <osm>
     *   <user>john</user>
     *   <uid>1</uid>
     *   <changeset>
     *     <tag k="created_by" v="JOSM 1.61"/>
     *     <tag k="comment" v="Just adding some streetnames"/>
     *     ...
     *   </changeset>
     *   ...
     *  </osm>
     *
     * @apiExample {curl} Example Usage
     *    curl -X PUT -d @changeset.xml -H 'Content-Type: text/xml' http://localhost:4000/changeset/create
     *
     * @apiSuccessExample {Number} Success-Response:
     *  1194
     */
    method: 'PUT',
    path: '/api/0.6/changeset/create',
    handler: changesetCreate
  }
];
