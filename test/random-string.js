const envir = require('../envir');
const randomString = require('../lib/random-string');
const should = require('should');

describe('random String', function () {
	it('get random string', () => {
		let str = randomString(512);
		str.should.length(512);
		str.should.not.match(/[^A-Z]/g)
	})
	it('use lowwer', () => {
		let str = randomString(512, true);
		str.should.length(512);
		str.should.not.match(/[^A-Za-z]/g)
	})
})
