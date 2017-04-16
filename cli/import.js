const Collect = require('collect-info');
const fs = require('fs');

let sqlinfo = {
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'pache',
	port: 3306,
};

const SelectForm = new Collect([
	{ name: 'select',
		prompt: '请选择数据源（0 = WebAPI，1 = MySQL）：',
		type: Number.isInteger,
	}
]);

const APIForm = new Collect([
	{ name: 'url',
		prompt: 'Pache URL：',
		catch: '不能有空值：',
		type: String,
	},
	{ name: 'pw',
		prompt: '后台密码：',
		catch: '不能有空值：',
		type: String,
	}
]);

const SQLForm = new Collect([
	{ name: 'host',
		prompt: 'MySQL 地址：',
		catch: '不能有空值：',
		type: String
	},
	{ name: 'port',
		prompt: 'MySQL 端口（3306）：',
		default: 3306,
		type: Number.isInteger,
		catch: '端口号必须为整数：'
	},
	{ name: 'user',
		prompt: '数据库用户名：',
		catch: '不能有空值：',
		type: String
	},
	{ name: 'password',
		prompt: '数据库密码：',
		default: '',
		type: String
	},
	{ name: 'database',
		prompt: 'Pache 数据库名：',
		type: String,
		catch: '不能有空值：'
	},
	{ name: 'pache_article',
		prompt: 'Pache 文章表名（pache_article)：',
		default: 'pache_article',
		type: String,
	},
	{ name: 'pache_tag',
		prompt: 'Pache 文章标签表名（pache_tag）：',
		default: 'pache_tag',
		type: String,
	}
]);

const importFromMySQL = () => {
	const mover = require('../lib/mover');
	return SQLForm.start()
		.then(obj => {
			console.log('开始从 SQL 存储中收集数据')
			return mover.getSqlArticles(obj, obj.pache_article, obj.pache_tag)
		})
		.then(collection => {
			console.log('已收集文章： ', collection.articles.length);
			console.log('标签集： ', collection.tags.length);

			console.log('开始转换为新 Pache 的格式')
			return Promise.resolve(mover['PHPArticleCollection>>>NewArticleCollection'](collection));
		})
		.then(collection => {
			console.log('转换完成，文章数：', collection.length);
			console.log('开始存入 MongoDB，请不要关闭计算机');
			return mover.saveArticleCollection(collection)
		})
		.then(result => {
			fs.writeFileSync('collection-result.json', JSON.stringify(result, 1, '\t'))
			console.log('完成，结果已保存为 ./collection-result.json')
		})
		.then(() => {
			process.exit(0);
		})
};
const importFromWebAPI = async () => {
	const info = await APIForm.start()

	const Pache = require('./php-pache')
	const shell = new Pache(info)

	console.info('開始下載文章')
	shell.on('push-article', function (article) {
		console.info(`[${shell.records.length}]已下載：`, article.title)
	});
	let res = await shell.syncData()
	console.info('下載完成，開始轉換')
	const PacheArticleData = shell.convert()

	let ContentLength = 0
	PacheArticleData.articles.forEach(art => ContentLength += art.content.length + art.format.length + art.title.length)

	console.info(
		`轉換完成，分類有：${Object.keys(PacheArticleData.categories)}\n` +
		`一共有 ${PacheArticleData.articles.length} 篇文章\n` +
		`\n`
	)
	let confirmContinue = new Collect([
		{ name: 'continue',
			prompt: '接下來將會開始保存轉換而來的文章，結果將不可逆，你確定嗎？(yes 確定)：',
			type: String,
		}
	])

	if ('yes' === (await confirmContinue.start()).continue) {
		console.info('執行保存')
		let saveResult = await PacheArticleData.saveAll()
		console.info('已入庫，將開始保存已轉換的文章到 ./converted-article.json')
		fs.writeFileSync('converted-article.json', JSON.stringify(saveResult, 1, '\t'))
		console.info('已保存')
	}

	process.exit()
};

module.exports = async function () {
	console.log('PHP-Pache 数据迁移程序')
	console.warn('导入操作前，请务必做好先前文章的备份\n')

	try {
		var obj = await SelectForm.start()
		if (obj.select) {
			return await importFromMySQL()
		} else {
			return await importFromWebAPI()
		}
	} catch (err) {
		console.error('错误', err)
		throw err
	}
};
