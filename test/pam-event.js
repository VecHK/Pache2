const should = require('should');

const PamEventEmitter = require('../admin/src/pam-event.js');

let test = (pe) => {
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
	it('bind multi Handle', () => {
		let i = 0;
		const fnList = [
			() => ++i,
			() => ++i,
			() => ++i
		];
		pe.on('fnList', ...fnList);
		pe.emit('fnList');

		i.should.equal(3);
	});
	it('bind multi Event', () => {
		let i = 0;
		const fn = () => ++i;
		const evList = ['fn1', 'fn2', 'fn3', 'fn4'];

		pe.on(evList, fn);
		evList.forEach(evName => pe.emit(evName));

		i.should.equal(4);
	})

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
};

describe('直接在构造函数的实例中使用', () => {
	const pe = new PamEventEmitter;
	test(pe);
});

describe('在其他对象中使用', () => {
	const bindPe = {};
	PamEventEmitter.use(bindPe);
	test(bindPe);
})
