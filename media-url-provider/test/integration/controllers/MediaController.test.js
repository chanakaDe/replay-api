var request = require('supertest'),
	assert = require('chai').assert,
	VideoCompartment = require('replay-schemas/VideoCompartment'),
	Video = require('replay-schemas/Video');

const MANIFEST_SUFFIX = '/manifest.mpd';

function test() {
	describe('MediaController', function() {
		findOne();
	});
}

function findOne() {
	describe('Normal behavior', function() {
		var id = '57a70996d7230637394ccc62';
		var videoFileName;
		beforeEach(function(done) {
			VideoCompartment.findOne({ _id: id }, function(err, videoComp) {
				if (err || videoComp === null) {
					done(err);
				} else {
					Video.findOne({ _id: videoComp.videoId }, function(err, video) {
						if (err || videoComp === null) {
							done(err);
						} else {
							videoFileName = video.videoFileName;
							done();
						}
					});
				}
			});
		});
		it('should return url for media request', function(done) {
			request(sails.hooks.http.app)
				.get('/media/' + id)
				.expect(200)
				.expect(function(res) {
					assert.include(res.body.url, MANIFEST_SUFFIX);
					assert.include(res.body.url, videoFileName);
				})
				.end(done);
		});
	});

	describe('bad requests returns', function() {
		var id;
		beforeEach(function() {
			id = 'not mongo id';
		});
		it('should return bad request', function(done) {
			request(sails.hooks.http.app)
				.get('/media/' + id)
				.expect(400, done);
		});
	});
}

test();