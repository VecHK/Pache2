const mongoose = require('mongoose');
const envir = require('../envir');

let model = {
	Article: require('./article') && mongoose.model('Article'),
	connect(){
		return new Promise((resolve, reject) => {
			mongoose.connect(envir.db, {
				server: { poolSize: 20 },
			}, function (err) {
				if (err) {
					reject(err);
				}
				else {
					model.removeCollection = mongoose.connection.db.dropCollection.bind(mongoose.connection.db);
					resolve();
				}
			});
		})
	},
	mongoose,
};
model.connectStatus = model.connect();

module.exports = model;
