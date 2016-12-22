const should = require('should');

const PamEventEmitter = require('../admin/src/pam-event.js');

describe('event emit', () => {
	const pe = new PamEventEmitter;
	let value = 0;
	const f = function (set) {
		value = set;
	};
	it('bind a event', () => {
		pe.on('test', f);
		pe.should
			.has.property('_evpool')
			.has.property('test')
			.length(1)
			.containEql(f);
	});
	it('emit a event', () => {
		const arg = 9;
		pe.emit('test', arg);
		value.should.equal(arg);
	});

	it('remove a event', () => {
		const f2 = function () { console.log('ttttttttttttttttt') };
		pe.on('test', f2);
		pe.remove('test', f2);

		pe._evpool.should
			.has.property('test')
			.is.an.Array()
			.and.containEql(f)
			.length(1)
	});

	it('clear a event', () => {
		pe.on('test', function () {});
		pe.on('test', function () {});

		pe.clear('test');

		pe._evpool.test.should
			.is.an.Array()
			.length(0)
	})
});
