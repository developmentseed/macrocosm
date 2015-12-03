'use strict';
var XML = require('../services/xml');
var create = require('./changeset-create').handler;
var upload = require('./changeset-upload').handler;
var Boom = require('boom');
/*
  This route combines changeset id creation,
  XML reading and changeset upload
*/

function oscUpload(req, res) {
  try {
    var json = XML.read(req.payload.toString());
  } catch(e) {
    if (e) {
      return res(Boom.badRequest('Could not parse XML file'));
    }
  }
  var uploadParams = {
    params: {
      changesetID: req.params.changesetID
    },
    payload: {
      osmChange: json
    }
  };
  if (!req.params.changesetID) {
    create({payload: {uid: 99, user: 'openroads'}},
      function(fromCreate) {
        if (fromCreate.isBoom) {

          //Couldn't create a changeset
          res(fromCreate);
        } else {
          uploadParams.params.changesetID = parseInt(fromCreate.id, 10);
          upload(uploadParams, res);
        }
      });
  } else {
    upload(uploadParams, res);
  }
}

module.exports = {
  /**
   * @api {POST} /upload/[changesetId] Bulk Upload
   * @apiGroup Changeset
   * @apiName UploadBulk
   * @apiDescription Upload OSM Changeset Data to a given changeset.
   * Return the changeset and a bounding box that covers the location of its
   * edits.
   * @apiVersion 0.1.0
   * 
   * @apiParam {Number} [changesetID] Changeset ID
   * @apiParam  {File} file OSM XML File
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
   *  curl -d @road.osm http://localhost:4000/upload
   *
   * @apiSuccessExample {json} Success-Response:
   *  {"changeset":
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
   *     }
   *  }
   */
  method: 'POST',
  path: '/upload/{changesetID?}',
  config: {
    payload: {
      parse: false
    }
  },
  handler: oscUpload
};