const fs = require('fs');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const cluster = require('cluster');
const package = require('../package');

const envir = {
	version: package.version,
};

const CONFIG_PATH = './config.suc';

try {
	Object.assign(envir, suc.parse(fs.readFileSync(CONFIG_PATH).toString()));
} catch (e) {
	console.error(`Envir 初始化失败，请检查 ${CONFIG_PATH} 是否存在，或者检查 Suc 语法是否正确`);
	throw e;
}

const getPool = [];
Object.assign(exports, envir, {
	setEnvir(workers) {
		for (let cursor = 0; cursor < workers.length; ++cursor) {
			workers[cursor].send({
				type: 'envir',
				envir,
			});
		}
	},
	_setup: true,
	get(propertyName, cb){
		if (envir._setup) {
			cb(envir[propertyName]);
		} else {
			getPool.push(() => {
				cb(envir[propertyName])
			});
		}
	}
});
