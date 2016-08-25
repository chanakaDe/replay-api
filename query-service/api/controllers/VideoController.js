/**
 * VideoController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
    _ = require('lodash'),
    Query = require('replay-schemas/Query'),
    Video = require('replay-schemas/Video'),
    Tag = require('replay-schemas/Tag');

// trick sails to activate restful API to this controller
sails.models.video = {};

module.exports = {

    find: function (req, res, next) {
        validateFindRequest(req)
            .then(saveUserQuery)
            .then(buildMongoQuery)
            .then(performMongoQuery)
            // .then(performElasticQuery)
            // .then(intersectResults)
            .then(function (results) {
                return res.json(results);
            })
            .catch(function (err) {
                return res.serverError(err);
            });
    },

    update: function (req, res, next) {
        validateUpdateRequest(req)
            .then(performUpdate)
            .then(function () {
                return res.ok();
            })
            .catch(function (err) {
                return res.serverError(err);
            });
    }
};

function validateFindRequest(req) {
    return new Promise(function (resolve, reject) {
        // make sure we have at least one attribute
        if (!req.query) {
            return reject(new Error('Empty query is not allowed.'));
        }

        // validate boundingShapeCoordinates is JSON parsable (since the array would be passed as string)
        if (req.query.boundingShapeCoordinates) {
            try {
                JSON.parse(req.query.boundingShapeCoordinates);
            } catch (e) {
                return reject(new Error('boundingShapeCoordinates is not parsable.'));
            }
        }

        if (req.query.tagsIds) {
            try {
                JSON.parse(req.query.tagsIds);
            } catch (e) {
                return reject(new Error('tagsIds is not parsable.'));
            }
        }

        resolve(req);
    });
}

function validateUpdateRequest(req) {
    return new Promise(function (resolve, reject) {
        // make sure we have at least one attribute
        if (!req.query) {
            return reject(new Error('Empty update is not allowed.'));
        } else if (req.query && Object.keys(req.body).length === 1 && req.body.tag) {
            // allow update of specific fields only //
            return resolve(req);
        }

        reject(new Error('Update is not allowed for the specified fields.'));
    });
}

// make sure we have at least one query param
function hasAnyQueryParam(query) {
    if (query.fromVideoTime || query.toVideoTime ||
        query.minVideoDuration || query.minVideoDuration || query.copyright ||
        query.minTraceHeight || query.minTraceWidth || query.source ||
        (query.boundingShapeType && query.boundingShapeCoordinates)) {
        return true;
    }
}

function saveUserQuery(req) {
    var coordinates, tagsIds, boundingShape;

    // parse some specific fields if they exist
    if (req.query.boundingShapeCoordinates) {
        coordinates = JSON.parse(req.query.boundingShapeCoordinates);
    }

    if (req.query.tagsIds) {
        tagsIds = JSON.parse(req.query.tagsIds);
    }

    if(req.query.boundingShapeType && req.query.boundingShapeCoordinates) {
        var boundingShape = {
            type: req.query.boundingShapeType,
            coordinates: coordinates
        };
    }

    return Query.create({
        fromVideoTime: req.query.fromVideoTime,
        toVideoTime: req.query.toVideoTime,
        minVideoDuration: req.query.minVideoDuration,
        maxVideoDuration: req.query.maxVideoDuration,
        copyright: req.query.copyright,
        minTraceHeight: req.query.minTraceHeight,
        minTraceWidth: req.query.minTraceWidth,
        minMinutesInsideShape: req.query.minMinutesInsideShape,
        sourceId: req.query.sourceId,
        tagsIds: tagsIds,
        boundingShape: boundingShape
    });
}

function buildMongoQuery(query) {
    // build the baseline of the query
    var mongoQuery = {
        $and: [
            { status: 'ready' }
        ]
    };

    // append the fields the user specified

    if (query.fromVideoTime) {
        mongoQuery.$and.push({
            startTime: { $gte: query.fromVideoTime }
        });
    }

    if (query.toVideoTime) {
        mongoQuery.$and.push({
            endTime: { $lte: query.toVideoTime }
        });
    }

    if (query.minVideoDuration) {
        mongoQuery.$and.push({
            durationInSeconds: { $gte: query.minVideoDuration }
        });
    }

    if (query.maxVideoDuration) {
        mongoQuery.$and.push({
            durationInSeconds: { $lte: query.maxVideoDuration }
        });
    }

    if (query.sourceId) {
        mongoQuery.$and.push({
            sourceId: query.sourceId
        });
    }

    if (query.tagsIds && query.tagsIds.length > 0) {
        mongoQuery.$and.push({
            tags: { $in: query.tagsIds }
        });
    }

    if (query.boundingShape) {
        mongoQuery.$and.push({ 
            boundingPolygon: { $geoIntersects: { $geometry: query.boundingShape } } 
        });
    }

    // skip check of minimum width & height and minimum duration inside intersection


    // return the original query for later use, and the built mongo query
    return Promise.resolve(mongoQuery);
}

function performMongoQuery(mongoQuery) {
    console.log('Performing mongo query:', JSON.stringify(mongoQuery));

    return Video.find(mongoQuery).populate('tags');
}

function performUpdate(req) {
    var updateQuery = {};

    if (req.body.tag) {
        return findOrCreateTagByTitle(req.body.tag)
            .then(function (tag) {
                updateQuery.$addToSet = {
                    tags: tag._id
                };
                return updateVideo(req.params.id, updateQuery);
            });
    }

    return updateVideo(req.params.id, updateQuery);
}

// find a Tag with such title or create one if not exists.
function findOrCreateTagByTitle(title) {
    // upsert: create if not exist; new: return updated value
    return Tag.findOneAndUpdate({
        title: title
    }, {
            title: title
        }, {
            upsert: true,
            new: true
        });
}

function updateVideo(id, updateQuery) {
    console.log('Updating video by id', id, 'Update is:', updateQuery);
    return Video.findOneAndUpdate({
        _id: id
    }, updateQuery);
}

