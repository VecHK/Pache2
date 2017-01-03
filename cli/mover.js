const Collect = require('collect-info')
const request = require('supertest')
const PacheSQL = require('../lib/pache-sql')
const libArticle = require('../lib/article')
const asyncEach = require('../lib/async-each');

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


const JsonMiddle = res => {
	console.log(res.text);
	res.json = JSON.parse(res.text);
	return Promise.resolve(res);
};

Object.assign(exports, {
	router(stdin = process.stdin){
		console.log('Pache 数据迁移程序\n------------------------------')

		this.stdin = stdin;
		SelectForm.start(stdin)
			.then(status => {
				if (status.select) {
					this.mysql();
				} else {
					this.webapi();
				}
			})
			.catch(err => { console.error(err); throw err })
	},

	/* Pache 的 SQL 集转到 Pache2 的格式 */
	['PHPArticleCollection' + '>>>' + 'NewArticleCollection'](collection){
		const {articles, tags} = collection;

		const getTagsById = (id) => {
			const resultTags = new Set;
			tags.forEach(tag => (id === tag.articleid) && resultTags.add(tag.tagname));
			return Array.from(resultTags);
		};

		return newCollection = articles.map(article => {
			return {
				tags: getTagsById(article.id),
				title: article.title,
				content: article.content,
				contentType: article.type,
				date: new Date(article.time),
				mod: new Date(article.ltime),
				_old_id: article.id,
			};
		})
	},
	saveArticleCollection(ArticleCollection){
		return new Promise((resolve, reject) => {
			let result = [];
			asyncEach(ArticleCollection, ({status, item, next}) => {
				libArticle.insert(item)
					.then(insert => {
						insert._old_id = item._old_id;
						result.push(insert)
						next();
					})
					.catch(err => reject(err))
			}, (status) => {
				resolve(result);
			})
		})
	},
	getSqlArticles(objInfo, ARTICLE_TABLE, TAGS_TABLE){
		const sql = new PacheSQL(objInfo);
		let articles = null;
		let tags = null;
		return sql.connect()
			.then(() => sql.query(`SELECT * FROM \`${ARTICLE_TABLE}\``))
			.then(rows => articles = rows)
			.catch(err => {
				const getErr = new Error(`从文章表（${ARTICLE_TABLE}）获取数据时出现错误`);
				getErr.sourceError = err;
				throw getErr;
			})

			.then(() => sql.query(`SELECT * FROM \`${TAGS_TABLE}\``))
			.then(rows => tags = rows)
			.catch(err => {
				if (err.sourceError) {
					throw err
				} else {
					const getErr = new Error(`从标签表（${TAGS_TABLE}）获取数据时出现错误`);
					getErr.articles = articles;
					getErr.sourceError = err;
					throw getErr;
				}
			})
			.then(() => Promise.resolve({tags, articles}))
	},
	mysql(stdin = this.stdin){
		return SQLForm.start(stdin)
			.then(obj => this.getSqlArticles(obj, obj.pache_article, obj.pache_tag))
			.catch(err => { console.error('连接错误：', err); throw err })
	},
	webapi(stdin = process.stdin){
		return APIForm.start()
			.then(obj => {
				const adUrl = `/admin/ad.php?pw=${obj.pass}&type=getindex&display=json&page=1&limit=2147483647`;
				console.log(adUrl);
				console.log('获取列表……');
				return request(obj.callback).get(adUrl)
			})
			.then(res => {
				if (res.status !== 200) {
					console.warn(res.text);
					throw new Error('出错了，状态码：' + res.status);
				} else {
					return Promise.resolve(res);
				}
			})
			.then(JsonMiddle)
			.then(res => {
				const idArr = res.json.articles.map(item => item.id);

				console.log(idArr);
			})
			.catch(err => { console.error(err); throw err })
	},
});
