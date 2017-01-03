#!/usr/bin/env node

const package = require('../package');
const editor = require('editor');
const path = require('path');

const Suc = require('node-suc').Suc;
const suc = new Suc;

const yargs = require('yargs')
	.usage('用法： pache [command] [option]')
	.option('c', {
		describe: '指派 config.suc 的位置（默认为 Pache 目录中的 ./config.suc）',
	})

	.command(['version', 'ver'], '查看 Pache 版本', {}, argv => {
		console.log(package.version)
		process.exit(0)
	})
	.command(['import'], '转移 php-Pache 的数据', {}, argv => {
		console.log('PHP-Pache 数据迁移程序')
		process.exit(0)
	})
	.command(['view-config'], '查看 Pache 配置', {}, argv => {
		let sucPath = path.join(__dirname, '../config.suc')
		if (argv.c) { sucPath = argv.c }

		const envir = require('../envir');

		envir.CONFIG_PATH = sucPath;

		try {
			envir.reload()
			const printKeyValue = function (jumpChar, key, value) {
				process.stdout.write(Array(jumpChar).fill('').join(' ') + value + '\r')
				process.stdout.write(key)
				process.stdout.write('\n')
			};
			const jump = 18;
			process.stdout.write(`--- ${envir.CONFIG_PATH}\n`)
			printKeyValue(jump, 'MongoDB 地址:', envir.db)
			printKeyValue(jump, 'http 端口:', envir.port)
			printKeyValue(jump, '密码:', envir.pass)
			printKeyValue(jump, '单页最大文章数:', envir.limit)
			printKeyValue(jump, '是否启用 PAE:', envir.ENABLE_PAE)
			printKeyValue(jump, 'cluster 线程数:', envir.cluster_fork_num)
		} catch (e) {
			console.error(e.message)
			console.error(e.sourceError)
			process.exit(1);
		}

		process.exit(0);
	})
	.command(['config'], '修改 Pache 配置', {}, argv => {
		let sucPath = `${__dirname}/../config.suc`;
		if (argv.c) { sucPath = argv.c }

		editor(sucPath, {}, function (code, sig) {
			if (code) {
				console.info(`似乎出错了，返回码：${code}`)
				process.exit(1);
			} else {
				console.info('重新启动程序以应用设置');
			}
			process.exit(0);
		});
	})
	.command(['run', 'web'], '启动 Web 服务', {}, argv => {
		require('../master');
	})
	.help('h')
	.alias('h', 'help')
	.epilog('FutureSoft 2017')
	.default('h')
;

const argv = yargs.argv;
