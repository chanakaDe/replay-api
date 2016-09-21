/**
 * VideoMetadataController
 *
 * @description :: Server-side logic for managing videometadatas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
	VideoMetadata = require('replay-schemas/VideoMetadata');

module.exports = {
	find: function(req, res, next) {
		validateFindRequest(req)
			.then(() => VideoMetadataService.getVideoMetadatas(req.query))
			.then(function(results) {
				return res.json(results);
			})
			.catch(function(err) {
				return res.serverError(err);
			});
	}
};

function validateFindRequest(req) {
	return new Promise(function(resolve, reject) {
		// make sure we have at least one attribute
		if (!req.query || !req.query.videoId) {
			return reject(new Error('Empty query is not allowed.'));
		}

		resolve(req);
	});
}
