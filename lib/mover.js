const request = require('supertest')
const PacheSQL = require('./pache-sql')
const libArticle = require('./article')
const asyncEach = require('./async-each');

Object.assign(exports, {
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
				content: article.article,
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
/*
	webapi(stdin = process.stdin){
		const JsonMiddle = res => {
			res.json = JSON.parse(res.text);
			return Promise.resolve(res);
		};
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
*/
});
