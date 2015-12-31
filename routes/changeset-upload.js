'use strict';

var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');

var knex = require('../connection.js');
var BoundingBox = require('../services/bounding-box.js');
var log = require('../services/log.js');

var models = {
  node: require('../models/node-model.js'),
  way: require('../models/way.js'),
  relation: require('../models/relation.js')
};

function upload(req, res) {
  var changesetID = req.params.changesetID;
  if (!changesetID || isNaN(changesetID)) {
    return res(Boom.badRequest('Changeset ID must be a non-zero number'));
  }

  var changesetPayload = req.payload.osmChange;
  if (!changesetPayload) {
    log.error('No json or cannot parse req.payload.osmChange');
    return res(Boom.badRequest('Problem reading changeset JSON'));
  }

  knex('changesets')
    .where('id', changesetID)

    .then(function(meta) {
      if (meta.length === 0) {
        return res(Boom.badRequest('Could not find changeset'));
      }
      return _upload(meta[0], changesetPayload).catch(function(err) {
        log.error('Changeset transaction fails', err);
        return res(Boom.badImplementation('Could not complete changeset actions'));
      });
    })

    .then(function(changeObject) {
      return res(changeObject);
    })

    .catch(function(err) {
      log.error('Changeset not found', err);
      return res(Boom.badRequest('Could not find changeset'));
    });
}

function _upload(meta, changeset) {
  // Useful to keep track of how long stuff takes.
  var time = new Date();
  log.info('Starting changeset transaction');
  return knex.transaction(function(transaction) {

    var queryData = {
      // Map of old ids to newly-created ones.
      map: {
        node: {},
        way: {},
        relation: {}
      },
      transaction: transaction,
      changeset: changeset,
      meta: meta
    };

    return models.node.save(queryData)
      .then(function() {
        log.info('Nodes transaction completed', (new Date() - time) / 1000, 'seconds');
        time = new Date();
        return models.way.save(queryData);
      })
      .then(function() {
        log.info('Ways transaction completed', (new Date() - time) / 1000, 'seconds');
        time = new Date();
        return models.relation.save(queryData);
      })
      .then(function(saved) {
        log.info('Relations transaction completed', (new Date() - time) / 1000, 'seconds');
        time = new Date();
        var newMeta = updateChangeset(meta, changeset);
        return knex('changesets')
          .where('id', meta.id)
          .update(newMeta)
          .then(function() {
            log.info('New changeset updated', (new Date() - time) / 1000, 'seconds');
            return {changeset: _.extend({}, newMeta, saved), created: queryData.map};
          });
      })
      .catch(function(err) {
        // Once we get here, rollback should happen automatically,
        // since we are returning promises in this transaction.
        // https://github.com/tgriesser/knex/issues/362

        log.error('Changeset update fails', err);
        return res(Boom.badImplementation('Could not update changeset'));
      });
  });
}

function updateChangeset(meta, changeset) {

  // Keep track of the number of changes this upload operation is doing.
  var numChanges = parseInt(meta.num_changes, 10) || 0;
  var nodes = [];
  ['create', 'modify', 'delete'].forEach(function(action) {
    if (changeset[action].node) {
      nodes = nodes.concat(changeset[action].node);
    }
    ['node', 'way', 'relation'].forEach(function(entity) {
      if (Array.isArray(changeset[action][entity])) {
        numChanges += changeset[action][entity].length;
      } else if (changeset[action][entity] != null) {
        // not null, but not an array either, so assume this is a single entry
        numChanges += 1;
      }
    });
  });

  var bbox = BoundingBox.fromNodes(nodes).toScaled();
  var newChangeset = {
    min_lon: bbox.minLon | 0,
    min_lat: bbox.minLat | 0,
    max_lon: bbox.maxLon | 0,
    max_lat: bbox.maxLat | 0,
    closed_at: new Date(),
    num_changes: numChanges
  };
  return newChangeset;
}

module.exports = {
  /**
   * @api {POST} /changeset/:id/upload Upload changeset data
   * @apiGroup Changeset
   * @apiName UploadChangeset
   * @apiDescription Upload JSON Changeset Data to given changeset
   * Return the changeset and a bounding box that covers the location of its
   * edits.
   *
   * The OSM Change JSON Format is the of the form
   * <pre><code>
   * {  <br>
   *   "version": 0.1, <br>
   *   "generator": "iD", <br>
   *   "create": {},  <br>
   *   "modify": {},  <br>
   *   "delete": {}, <br>
   * }
   *</code></pre>
   *
   * Each of the create, modify and delete blocks can contain entities such as Node, Way
   * or Relation. Check the API Usage Example for more detail.
   * @apiVersion 0.1.0
   *
   * @apiParam {Number} id Changeset ID
   * @apiParam {Object} osmChange OSM Changeset Data in JSON
   *
   * @apiSuccess {Object} changeset Changeset object
   * @apiSuccess {String} changeset.id Changeset ID.
   * @apiSuccess {String} changeset.user_id Changeset User ID.
   * @apiSuccess {Date} changeset.created_at Changeset Date of creation.
   * @apiSuccess {Number} changeset.min_lat Min Latitude of bounding box.
   * @apiSuccess {Number} changeset.max_lat Max Latitude of bounding box.
   * @apiSuccess {Number} changeset.min_lon Min Longitude of bounding box.
   * @apiSuccess {Number} changeset.max_lon Max Longitude of bounding box.
   * @apiSuccess {Date} changeset.closed_at Changeset Date of creation.
   * @apiSuccess {number} changeset.num_changes Number of edits in this changeset.
   *
   * @apiExample {curl} Example Usage:
   *  curl -d '{
   *   "osmChange": {
   *     "version":0.1,
   *     "generator":"openroads-iD",
   *     "create":{ },
   *     "modify":{
   *       "node":[
   *         {"id":"21851",
   *          "lon":123.9780018,
   *          "lat":9.7923478,"version":"1", "tag":[],
   *          "changeset":1 }]
   *     },
   *     "delete": {}
   *   }
   *  }' -H 'Content-Type: application/json' http://localhost:4000/changeset/1/upload
   *
   * @apiSuccessExample {json} Success-Response:
   *  {
   *  "changeset":
   *    {
   *     "id":"1",
   *     "user_id":"2254600",
   *     "created_at":"2015-03-13T03:51:39.000Z",
   *     "min_lat":97923478,
   *     "max_lat":97923478,
   *     "min_lon":1239780018,
   *     "max_lon":1239780018,
   *     "closed_at":"2015-04-21T18:44:51.858Z",
   *     "num_changes":31076
   *     },
   *  "created":
   *    {
   *     "node":{
   *       "-1":"743049",
   *       "-2":"743050",
   *       "-3":"743051"
   *       },
   *     "way":{
   *       "-1":"168483"
   *       }
   *     }
   *   }
   */
  method: 'POST',
  path: '/api/0.6/changeset/{changesetID}/upload',
  handler: upload
};
