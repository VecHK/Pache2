const mongoose = require('mongoose');
const envir = require('../envir');

require('./article');

mongoose.connect(envir.db, {
	server: { poolSize: 20 },
	function (err) {
		if (err) {
			console.error('mongodb 连接错误: ', envir.db, err.message);
			setTimeout(process.exit, 9, -1);
			throw err;
		}
		console.info('mongodb connected: ', envir.db);
	}
});

Object.assign(exports, {
	Article: require('./article') && mongoose.model('Article'),
	removeCollection: function (name, cb) {
		mongoose.connection.db.dropCollection(name, (err, result) => {
			if (err) {
				throw err;
			}
			cb(result);
		});
	},
});
