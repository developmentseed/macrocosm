'use strict';
var Boom = require('boom');

var knex = require('../connection.js');
var queryBbox = require('../services/query-bbox.js');
var XML = require('../services/xml.js');
var BoundingBox = require('../services/bounding-box.js');

function mapHandler (req, res) {
  // parse and validate bbox parameter from query
  // See services/BoundingBox.js.
  var paramString = req.query.bbox || '';
  var bbox = new BoundingBox.fromCoordinates(paramString.split(','));
  if (bbox.error) {
    return res(Boom.badRequest(bbox.error));
  }

  queryBbox(knex, bbox)
  .then(function(result) {
    var xmlDoc = XML.write({
      bbox: bbox,
      nodes: result.nodes,
      ways: result.ways,
      relations: result.relations
    });
    var response = res(xmlDoc.toString());
    response.type('text/xml');
  })
  .catch(function (err) {
    return res(Boom.wrap(err));
  });
}

module.exports = [
  {
    /**
     * @api {get} /xml/map OSM XML - Get entities in bounding box
     * @apiGroup bbox
     * @apiName XmlMap
     * @apiDescription Returns an OSM XML list of entities within the
     * provided bounding box
     * @apiVersion 0.1.0
     *
     * @apiParam {Number[4]} bbox [min_lon, min_lat, max_lon, max_lat]
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/xml/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <osm version="6" generator="OpenRoads">
     *  <bounds minlat="9.584500864717155" minlon="123.81042480468" maxlat="9.58991730708" maxlon="123.81591796875"/>
     *    <node id="74038" changeset="1" timestamp="Wed Mar 11 2015 09:38:41 GMT+0000" lat="9.5820416" lon="123.81629"/>
     *    <node id="77930" changeset="1" timestamp="Wed Mar 11 2015 09:38:41 GMT+0000" lat="9.5920337" lon="123.81491"/>
     *    ...
     *    <way id="77931" visible="true" version="1" changeset="0" timestamp="Wed Mar 11 2015 09:38:41 GMT+0000">
     *      <nd ref="77930"/>
     *      <nd ref="77932"/>
     *      ...
     *      <tag k="highway" v="secondary"/>
     *      <tag k="or_rdclass" v="provincial"/>
     *      <tag k="or_brgy" v="Dao"/>
     *    </way>
     *  </osm>
     */
    method: 'GET',
    path: '/xml/map',
    handler: mapHandler
  },
  {
    /**
     * @api {get} /api/0.6/map OSM XML - Get entities in bounding box
     * @apiGroup bbox
     * @apiName Map06
     * @apiDescription Returns an OSM XML list of entities within the
     * provided bounding box
     * @apiVersion 0.1.0
     *
     * @apiParam {Number[4]} bbox [min_lon, min_lat, max_lon, max_lat]
     *
     * @apiExample {curl} Example Usage:
     *    curl http://localhost:4000/xml/map?bbox=123.81042480468751,9.584500864717155,123.81591796875,9.58991730708743
     *
     * @apiSuccessExample {xml} Success-Response:
     *  <osm version="6" generator="OpenRoads">
     *  <bounds minlat="9.584500864717155" minlon="123.81042480468" maxlat="9.58991730708" maxlon="123.81591796875"/>
     *    <node id="74038" changeset="1" timestamp="Wed Mar 11 2015 09:38:41 GMT+0000" lat="9.5820416" lon="123.81629"/>
     *    <node id="77930" changeset="1" timestamp="Wed Mar 11 2015 09:38:41 GMT+0000" lat="9.5920337" lon="123.81491"/>
     *    ...
     *    <way id="77931" visible="true" version="1" changeset="0" timestamp="Wed Mar 11 2015 09:38:41 GMT+0000">
     *      <nd ref="77930"/>
     *      <nd ref="77932"/>
     *      ...
     *      <tag k="highway" v="secondary"/>
     *      <tag k="or_rdclass" v="provincial"/>
     *      <tag k="or_brgy" v="Dao"/>
     *    </way>
     *  </osm>
     */
    method: 'GET',
    path: '/api/0.6/map',
    handler: mapHandler
  }
];
