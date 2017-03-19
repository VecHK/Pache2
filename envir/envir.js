const pkg = require('../package')
const fs = require('fs');
const path = require('path');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const npmPackage = require('../package');
const cluster = require('cluster');

const printKeyValue = function (jumpChar, key, value) {
	process.stdout.write(Array(jumpChar).fill('').join(' ') + value + '\r')
	process.stdout.write(key)
	process.stdout.write('\n')
};

class Envir {
	printInfo(){
		const jump = 18;
		process.stdout.write(`--- Pache ${pkg.version}\n`)
		process.stdout.write(`--- ${this.CONFIG_PATH}\n`)
		printKeyValue(jump, 'MongoDB 地址:', this.db)
		printKeyValue(jump, 'http 端口:', this.port)

		printKeyValue(jump, 'https 是否启用', envir.enable_https)
		if (envir.enable_https) {
			printKeyValue(jump, '私钥路径', envir.private_key)
			printKeyValue(jump, '证书路径', envir.certificate)
			printKeyValue(jump, '是否强制 https', envir.force_https)
		}

		printKeyValue(jump, '密码:', this.pass.split('').fill('*').join(''))
		printKeyValue(jump, '单页最大文章数:', this.limit)
		printKeyValue(jump, '是否启用 PAE:', this.ENABLE_PAE)
		printKeyValue(jump, 'cluster 线程数:', this.cluster_fork_num)

		printKeyValue(jump, 'ESD 是否启用:', this.ESD_enable)
		if (this.ESD_enable) {
			this.ESD_list.forEach(esd_path => {
				printKeyValue(jump, '', esd_path);
			})
		}

	}
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
	}
	setEnvir(workers) {
		for (let cursor = 0; cursor < workers.length; ++cursor) {
			workers[cursor].send({
				type: 'envir',
				envir: this,
			});
		}
	}
	get(propertyName, cb){
		cb(this[propertyName]);
	}
}
Object.assign(Envir.prototype, {
	version: npmPackage.version,
	CONFIG_PATH: path.join(__dirname, '../config.suc'),
});

let envir = new Envir;

if (cluster.isMaster) {
	envir.reload()
}

module.exports = envir;
