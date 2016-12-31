const fs = require('fs');
const path = require('path');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const package = require('../package');

const envir = {
	version: package.version,
	CONFIG_PATH: './config.suc',
	reload(){
		try {
			Object.assign(this, suc.parse(
				fs.readFileSync(path.join(__dirname, '../', this.CONFIG_PATH)).toString()
			));
		} catch (e) {
			const err = new Error(`Envir 初始化失败，请检查 ${this.CONFIG_PATH} 是否存在，或者检查 Suc 语法是否正确`)
			throw err;
		}
	},
};

envir.reload();

module.exports = envir;
