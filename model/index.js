const mongoose = require('mongoose');
const envir = require('../envir');

const connectStatus = new Promise(function (resolve, reject) {
	mongoose.connect(envir.db, {
		server: { poolSize: 20 },
	}, function (err) {
		if (err) { reject(err) }
		else { resolve() }
	});
});

let model = {
	Article: require('./article') && mongoose.model('Article'),
	removeCollection: mongoose.connection.db.dropCollection.bind(mongoose.connection.db),
	mongoose,
	connectStatus
};

module.exports = model;
