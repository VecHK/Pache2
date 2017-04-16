#!/usr/bin/env node

const package = require('../package')
const editor = require('editor')
const path = require('path')

const Suc = require('node-suc').Suc
const suc = new Suc

const yargs = require('yargs')
	.usage('用法： pache [command] [option]')
	.option('c', {
		describe: '指派 config.suc 的位置（默认为 Pache 目录中的 ./config.suc）',
	})

	.command(['import [configpath]'], '导入 Pache-Classic 的文章数据', {}, argv => {
		const envir = require('../envir')
		let sucPath = argv.configpath || path.join(__dirname, '../config.suc')
		envir.CONFIG_PATH = sucPath
		envir.reload()

		try {
			const PacheImport = require('../cli/import')
			PacheImport()
		} catch (e) {
			console.error(e)
		}
	})
	.command(['export [configpath] [filepath]'], '导出 Pache 的文章数据', {}, argv => {
		const envir = require('../envir')
		let sucPath = argv.configpath || path.join(__dirname, '../config.suc')
		envir.CONFIG_PATH = sucPath
		envir.reload()

		const pacheExport = require('../cli/export')

		pacheExport(argv.filepath)
			.then(() => process.exit(0))
			.catch(() => process.exit(1))
	})
	.command(['clear'], '清空 Pache 的文章数据', {}, argv => {
		const PacheClear = require('../cli/clear')

		PacheClear()
			.then(() => process.exit(0))
			.catch(() => process.exit(1))
	})
	.command(['view [configpath]'], '查看 Pache 配置文件', {}, argv => {
		const envir = require('../envir')
		let sucPath = argv.configpath || path.join(__dirname, '../config.suc')
		envir.CONFIG_PATH = sucPath

		try {
			envir.reload()
			envir.printInfo()
		} catch (e) {
			console.error(e.message)
			console.error(e.sourceError)
			process.exit(1)
		}

		process.exit(0)
	})
	.command(['config [configpath]'], '修改 Pache 配置文件，不存在則創建默認配置的副本', {}, argv => {
		const sucPath = argv.configpath || `${__dirname}/../config.suc`

		editor(sucPath, {}, function (code, sig) {
			if (code) {
				console.info(`似乎出错了，返回码：${code}`)
				process.exit(1)
			} else {
				console.info('重新启动程序以应用设置')
			}
			process.exit(0)
		})
	})
	.command(['version'], '查看 Pache 版本', {}, argv => {
		console.info(package.version)
		process.exit(0)
	})
	.command(['run [configpath]'], '启动 Web 服务', {}, argv => {
		const cluster = require('cluster')
		try {
			if (cluster.isMaster) {
				const envir = require('../envir')

				let sucPath;
				if (argv.configpath) {
					sucPath = argv.configpath
				} else {
					console.warn('非開發環境下不推薦採用默認配置文件啟動，你應該使用 `pache run [config.suc 路徑]` 作為非開發環境的配置文件')
					sucPath = path.join(__dirname, '../config.suc')
				}

				envir.CONFIG_PATH = sucPath
				envir.reload()
			}
			const app = require('../master')
			app()
		} catch (e) {
			console.error(e)
			throw e
		}

	})
	.help('h')
	.alias('h', 'help')
	.epilog('FutureSoft 2017')
	.default('h')


const argv = yargs.argv
