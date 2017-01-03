const asyncEach = require('../lib/async-each')
const should = require('should')

describe('asyncEach', () => {
	it('asyncEach 执行复数次', () => {
		let value = 0;
		let arr = [1, 4, 2];
		asyncEach(arr, (fetch) => {
			value += fetch.item;
			fetch.next();
		});
		value.should.equal(1 + 4 + 2);
	});
	it('asyncEach 重试', () => {
		let value = 0;
		let arr = [null];
		asyncEach(arr, (fetch) => {
			if (value === 0) {
				value = 1;
				fetch.retry();
			}
			fetch.next();
		});

		value.should.equal(1);
	});
	it('asyncEach 全部结束', (done) => {
		let value = 0;
		asyncEach([1], (fetch) => {
			value = 1;
			setTimeout(fetch.next, 5);
		}, () => {
			value.should.equal(1);
			done();
		});
	});
	it('asyncEach status状态', () => {
		let arr = [1, 2, 3, 4];
		asyncEach(arr, (fetch, status) => {
			if (status.p === undefined) {
				status.p = 0;
			}
			status.p += fetch.item;
		}, (status) => {
			status.p.should.equal(1 + 2 + 3 + 4);
		});
	});
});
