const mongoose = require('mongoose');
const EventEmitter = require('events');
const envir = require('../envir');

console.warn('數據庫：', envir.db)

const model = new EventEmitter
module.exports = model

Object.assign(model, {
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
})

model.connectStatus = model.connect();
