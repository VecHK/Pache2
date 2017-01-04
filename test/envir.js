
const should = require('should');
const cluster = require('cluster');

if (cluster.isMaster) {
	describe('Envir Master', () => {
		const envir = require('../envir')
		it('print info', () => {
			envir.printInfo()
		})
		it('setEnvir', done => {
			const workers = [cluster.fork()]
			envir.setEnvir(workers);
			done();
		})
		it('get', (done) => {
			/* envir.reload(); */
			envir.get('port', function (value) {
				should(value).equal(envir.port);
				done();
			})
		});
		it('使用错误的文件路径', () => {
			envir.CONFIG_PATH = './不存在的文件名';

			(() => envir.reload()).should.throw(`Envir 初始化失败，请检查 ${envir.CONFIG_PATH} 是否存在，或者检查 Suc 语法是否正确`)
		})
	})
}
