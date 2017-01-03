const utils = require('utility');
const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const model = require('../model');
const libArticle = require('../lib/article');

const mover = require('../cli/mover');

const should = require('should');

const compareDate = (t1, t2) => t1.toDateString() === t2.toDateString();

describe('getSqlArticles', function () {
	const SQLInfomation = {
		host: 'localhost',
		user: 'root',
		password: 'root',
		port: 3306,
		database: 'pache',
		pache_tag: 'pache_tag',
		pache_article: 'pache_article',
	};

	it('错误的标签表名', done => {
		const BAD_ARTICLE_TABLE = 'bad_pache_article';
		const SQLInfo = Object.assign({}, SQLInfomation, { pache_article: BAD_ARTICLE_TABLE })
		mover.getSqlArticles(SQLInfo, BAD_ARTICLE_TABLE, SQLInfo.pache_tag)
			.catch(err => {
				should(err.message).containEql('文章表')
				should(err.message).containEql(BAD_ARTICLE_TABLE)
				should(err.message).containEql('获取数据时出现错误')
				done()
			})
	})
	it('错误的标签表名', done => {
		const BAD_TAG_TABLE = 'bad_pache_tag';
		const SQLInfo = Object.assign({}, SQLInfomation, { pache_tag: BAD_TAG_TABLE })
		mover.getSqlArticles(SQLInfo, SQLInfo.pache_article, BAD_TAG_TABLE)
			.catch(err => {
				should(err.message).containEql('标签表')
				should(err.message).containEql(BAD_TAG_TABLE)
				should(err.message).containEql('获取数据时出现错误')

				err.should.has.property('articles');
				done()
			})
	})
	it('正常获取', done => {
		mover.getSqlArticles(SQLInfomation, SQLInfomation.pache_article, SQLInfomation.pache_tag)
			.then(PacheArticleCollection => {
				should(PacheArticleCollection).is.an.Object();
				should(PacheArticleCollection).has.property('articles').is.an.Array();
				should(PacheArticleCollection).has.property('tags').is.an.Array();
				done();
			})
			.catch(err => console.error(err))
	})
})
describe('老 Pache 的 SQL 集转换为 Pache 2 的格式', function () {
	const articles = [
		{ id: 9,
			title: 'title1',
			type: 'markdown',
			content: '# test',
			format: '<h1>test</h1>',
			time: new Date(2015, 10, 30, 23, 44, 00),
			ltime: new Date(2015, 11, 30, 23, 44, 00)
		},
		{ id: 33,
			title: 'title2',
			type: 'text',
			content: '这是一个文本',
			format: 'text:这是一个文本',
			time: new Date(2016, 0, 0, 23, 44, 00),
			ltime: new Date(2015, 1, 25, 23, 44, 00)
		}
	];
	const tags = [
		{ articleid: 9,
			tagname: '程序设计'
		},
		{ articleid: 9, tagname: '面向对象' },
		{ articleid: 9, tagname: '面向对象' },	//相同的 tagname

		/* 这是不存在的文章 id */
		{ articleid: 555,
			tagname: '不存在'
		},

		{ articleid: 33,
			tagname: '测试标签'
		}
	];
	it('转换成功', function () {
		const collection = { articles, tags };
		const result = mover['PHPArticleCollection>>>NewArticleCollection'](collection);

		should(result).is.an.Array().length(collection.articles.length);

		result.forEach((article, cursor) => {
			should(article).is.an.Object();

			should(article.tags).is.an.Array();

			should(article.title).equal(articles[cursor].title)
			should(article.contentType).equal(articles[cursor].type)
			should(article.content).equal(articles[cursor].content)

			compareDate(article.date, articles[cursor].time).should.equal(true)
			compareDate(article.mod, articles[cursor].ltime).should.equal(true)
		})

		should(result[0].tags).length(2)
		should(result[0].tags).containEql('面向对象')
		should(result[0].tags).containEql('程序设计')
	})
})

describe('saveArticleCollection', function () {
	it('正常入库', done => {
		const date = new Date(2015, 10, 4);
		const mod = new Date(2016, 11, 3);

		mover.saveArticleCollection([{
			_old_id: 992,
			title: 'testTitle',
			content: 'content',
			contentType: 'text',
			date,
			mod,
		}]).then(result => {
			should(compareDate(new Date(result[0].mod), mod)).equal(true);
			should(compareDate(new Date(result[0].date), date)).equal(true);
			should(result[0]._old_id).equal(992)
			done()
		})
			.catch(err => { console.error(err); throw err })
	})
	it('错误的 Collection', done => {
		mover.saveArticleCollection([null])
			.catch(err => { done() })
	})
})
