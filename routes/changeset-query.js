'use strict';

var Boom = require('boom');
var knex = require('../connection');
var _ = require('lodash');
var XML = require('../services/xml.js');

// Currently, this only supports querying the changeset table by user.
function changesetQuery(req, res) {
  var user = +req.query.user;
  if (isNaN(user) || (!user && user !== 0)) {
    return res(Boom.badRequest('invalid user ID'));
  }

  var userName;
  return knex.select('display_name').from('users')
  .where('id', user)
  .then(function (userResponse) {
    if (!userResponse.length) {
      return res(Boom.notFound('No user with that id!'));
    }
    userName = userResponse[0].display_name;
    return knex('changesets')
      .leftJoin('changeset_tags', 'changesets.id', '=', 'changeset_tags.changeset_id')
      .where('changesets.user_id', user)
      .select('changesets.*', 'changeset_tags.k', 'changeset_tags.v');
  })

  .then(function (changesets) {
    if (!changesets.length) {
      return res(Boom.notFound('No changesets found for that query'));
    }
    var result = _.chain(changesets).groupBy('id')
      .values()
      .map(function (tags) {
        var change = _.pick(tags[0], ['id', 'created_at', 'closed_at',
        'min_lat', 'max_lat', 'min_lon', 'max_lon', 'num_changes']);
        change.user = userName;
        change.uid = user;
        change.open = 'false';
        change.tags = tags.map(function (tag) {
          if (tag.hasOwnProperty('k') && tag.hasOwnProperty('v')
             && tag.k !== null && tag.v !== null) {
            return {
              k: tag.k,
              v: tag.v
            };
          }
          return false;
        }).filter(Boolean);
        return change
      }).value();
    return res(XML.write({changesets: result}).toString()).type('text/xml');
  });
}

module.exports = [
  {
    /**
     * @api {get} /changesets/:query Query the changeset table
     * @apiGroup Changeset
     * @apiName QueryChangeset
     * @apiDescription Query the changeset table for matching changesets, up to 100.
     * @apiVersion 0.1.1
     *
     * @apiParam {Number} user User ID
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/api/0.6/changesets?user=1234
     *
     * @apiSuccessExample {
     * <?xml version="1.0" encoding="UTF-8"?>
     * <osm version="0.6" generator="OpenStreetMap server" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">
     * <changeset id="39225667" user="derrrrrrrrrrrr" uid="2254600" created_at="2016-05-10T19:00:37Z" closed_at="2016-05-10T19:00:38Z" open="false" min_lat="41.2460723" min_lon="-80.8140538" max_lat="41.2460723" max_lon="-80.8140538" comments_count="0">
     * <tag k="comment" v="Remove something I placed here on accident."/>
     * <tag k="locale" v="en-US"/>
     * <tag k="host" v="http://www.openstreetmap.org/id"/>
     * <tag k="imagery_used" v="Bing"/>
     * <tag k="created_by" v="iD 1.9.4"/>
     * </changeset>
     * <changeset id="39221547" user="derrrrrrrrrrrr" uid="2254600" created_at="2016-05-10T15:57:24Z" closed_at="2016-05-10T15:57:25Z" open="false" min_lat="41.2459874" min_lon="-80.8139258" max_lat="41.2459874" max_lon="-80.8139258" comments_count="0">
     * <tag k="comment" v="Yo!"/>
     * <tag k="locale" v="en-US"/>
     * <tag k="host" v="http://localhost:8080/"/>
     * <tag k="imagery_used" v="Bing"/>
     * <tag k="created_by" v="iD 1.9.4"/>
     * </changeset>
     * </osm>
     */

    method: 'GET',
    path: '/api/0.6/changesets',
    handler: changesetQuery
  }
];
