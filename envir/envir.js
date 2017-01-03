const fs = require('fs');
const path = require('path');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const package = require('../package');

const printKeyValue = function (jumpChar, key, value) {
	process.stdout.write(Array(jumpChar).fill('').join(' ') + value + '\r')
	process.stdout.write(key)
	process.stdout.write('\n')
};

const envir = {
	version: package.version,
	CONFIG_PATH: path.join(__dirname, '../config.suc'),
	printInfo(){
		const jump = 18;
		process.stdout.write(`--- ${envir.CONFIG_PATH}\n`)
		printKeyValue(jump, 'MongoDB 地址:', this.db)
		printKeyValue(jump, 'http 端口:', this.port)
		printKeyValue(jump, '密码:', this.pass.split('').fill('*').join(''))
		printKeyValue(jump, '单页最大文章数:', this.limit)
		printKeyValue(jump, '是否启用 PAE:', this.ENABLE_PAE)
		printKeyValue(jump, 'cluster 线程数:', this.cluster_fork_num)
	},
	reload(){
		try {
			Object.assign(this, suc.parse(
				fs.readFileSync(this.CONFIG_PATH).toString()
			));
		} catch (e) {
			const err = new Error(`Envir 初始化失败，请检查 ${this.CONFIG_PATH} 是否存在，或者检查 Suc 语法是否正确`)
			err.sourceError = e;
			throw err;
		}
	},
};

envir.reload();

module.exports = envir;
