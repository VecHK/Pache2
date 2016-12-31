
describe('model connect', function () {
	it('connect fail', function (done) {
		const envir = require('../envir');
		const TEST_DB = 'pache_test';
		envir.db = `mongodb://bad:27017/${TEST_DB}`;
		this.timeout(10000)
		let model = require('../model')
		model.connect()
			.then(() => console.log('不可能连接成功的，常考'))
			.catch(err => done())
	})
})
