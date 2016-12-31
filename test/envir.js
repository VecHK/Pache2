const envir = require('../envir')
const should = require('should');

describe('Envir', () => {
	it('使用错误的文件路径', () => {
		envir.CONFIG_PATH = './不存在的文件名';

		(() => envir.reLoad()).should.throw(`Envir 初始化失败，请检查 ${envir.CONFIG_PATH} 是否存在，或者检查 Suc 语法是否正确`)
	})
})
