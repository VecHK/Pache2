const Collect = require('collect-info');
const mover = require('../lib/mover');
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
	{ name: 'callback',
		prompt: 'Pache 目录：',
		catch: '不能有空值：',
		type: String,
	},
	{ name: 'pass',
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
const importFromWebAPI = () => {
	return APIForm.start()
		.then(obj => mover.getSqlArticles(obj, obj.pache_article, obj.pache_tag))
		.then(collection => {
			console.log('已收集： ', collection.articles.length);
		})
		.catch(err => {
			//console.error(err);
		})
};

module.exports = function () {
	console.log('PHP-Pache 数据迁移程序')
	console.warn('导入操作前，请务必做好先前文章的备份\n')

	SelectForm.start()
		.then(obj => {
			if (obj.select) {
				return importFromMySQL()
			} else {
				return importFromWebAPI()
			}
		})
		.catch(err => { console.error('错误', err); throw err })
};
