/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var connectMongo = require('replay-schemas/connectMongo');

module.exports.bootstrap = function(cb) {
	// It's very important to trigger this callback method when you are finished
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	connectMongo(sails.config.mongo.host, sails.config.mongo.port, sails.config.mongo.database, sails.config.mongo.username, sails.config.mongo.password)
		.then(cb)
		.catch(function(err) {
			console.log('An error occured in bootstrap.');
			console.log(err);
		});
};
