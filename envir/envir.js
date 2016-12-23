const fs = require('fs');
const path = require('path');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const package = require('../package');

const CONFIG_PATH = './config.suc';

const envir = {
	version: package.version,
};

try {
	Object.assign(envir, suc.parse(
		fs.readFileSync(path.join(__dirname, '../', CONFIG_PATH)).toString()
	));
} catch (e) {
	console.error(`Envir 初始化失败，请检查 ${CONFIG_PATH} 是否存在，或者检查 Suc 语法是否正确`);
	throw e;
}

module.exports = envir;
