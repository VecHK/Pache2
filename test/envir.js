const envir = require('../envir')
const should = require('should');

describe('Envir', () => {
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
