'use strict';

module.exports = {
    /**
     * @api {POST} /api/0.6/changeset/:id/close Close a pending changeset
     * @apiGroup Changeset
     * @apiName Close
     * @apiDescription Close a pending changeset.
     *
     * @apiExample {curl} Example Usage:
     *  curl -X PUT http://localhost:4000/api/0.6/changeset/1/close
     */
  method: 'PUT',
  path: '/api/0.6/changeset/{changesetId}/close',
  handler: function changesetCreate(req, res) {
    return res();
  }
};
