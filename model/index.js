const mongoose = require('mongoose');
const envir = require('../envir');
console.warn('數據庫：', envir.db)
let model = {
	Category: require('./category') && mongoose.model('Category'),
	Article: require('./article') && mongoose.model('Article'),
	async connect() {
		try {
			var result = await mongoose.connect(envir.db, {
				server: { poolSize: 20 }
			})
			model.removeCollection = mongoose.connection.db.dropCollection.bind(mongoose.connection.db);
			return result
		} catch (err) {
			console.error(err)
			console.warn('數據庫連接似乎出現了問題')
			process.exit(-1)
		}
	},
	mongoose,
};
model.connectStatus = model.connect();

module.exports = model;
