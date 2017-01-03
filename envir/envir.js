const fs = require('fs');
const path = require('path');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const package = require('../package');

const envir = {
	version: package.version,
	CONFIG_PATH: path.join(__dirname, '../config.suc'),
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
