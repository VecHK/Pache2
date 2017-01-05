const utils = require('utility');
const envir = require('../envir');
const TEST_MONGO_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_MONGO_DB}`;

const model = require('../model');
const libArticle = require('../lib/article');

const mover = require('../lib/mover');
const PacheSQL = require('../lib/pache-sql')

const should = require('should');

const compareDate = (t1, t2) => t1.toDateString() === t2.toDateString();

const TEST_DB = 'pache_test';
const TEST_ARTICLE_TABLE = 'pache_article';
const TEST_TAG_TABLE = 'pache_tag';
const TAG_TABLE_DEFINE =
`CREATE TABLE \`pache_tag\` (
  \`tagname\` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  \`articleid\` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin`;
const ARTICLE_TABLE_DEFINE =
`CREATE TABLE \`pache_article\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  \`type\` varchar(16) COLLATE utf8_bin DEFAULT NULL,
  \`permission\` int(255) DEFAULT NULL,
  \`article\` longtext COLLATE utf8_bin,
  \`format\` longtext COLLATE utf8_bin,
  \`categories\` varchar(32) COLLATE utf8_bin DEFAULT NULL,
  \`time\` datetime DEFAULT NULL,
  \`ltime\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin`;


describe('getSqlArticles', function () {
	/*
		账号密码的配置有 travis 的原因
	 */
	const SQLInfomation = {
		host: '127.0.0.1',
		user: 'root',
		password: '',
		port: 3306,
	};

	/* 创建成功后会在 SQLInfomation 中添加一个 database 属性（方便后续的测试） */
	it('创建一个 MySQL 测试数据库，以及测试用的表', function (done) {
		this.timeout(5000);
		const sql = new PacheSQL(SQLInfomation)
		sql.connect()
			.then(() => sql.query(`CREATE DATABASE IF NOT EXISTS ${TEST_DB}`))
			.then((row, fields) => sql.query(`USE ${TEST_DB}`))
			.then((row, fields) => sql.query('DROP TABLE IF EXISTS `pache_tag`'))
			.then((row, fields) => sql.query(TAG_TABLE_DEFINE))
			.then((row, fields) => sql.query('DROP TABLE IF EXISTS `pache_article`'))
			.then((row, fields) => sql.query(ARTICLE_TABLE_DEFINE))
			.then((row, fields) => {
				Object.assign(SQLInfomation, { database: TEST_DB });
				done();
			})
			.catch(err => { console.error(err); throw err })
	})

	it('错误的标签表名', done => {
		const BAD_ARTICLE_TABLE = 'bad_pache_article';
		const SQLInfo = Object.assign({}, SQLInfomation, { pache_article: BAD_ARTICLE_TABLE })
		mover.getSqlArticles(SQLInfo, BAD_ARTICLE_TABLE, TEST_TAG_TABLE)
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
		mover.getSqlArticles(SQLInfo,TEST_ARTICLE_TABLE, BAD_TAG_TABLE)
			.catch(err => {
				should(err.message).containEql('标签表')
				should(err.message).containEql(BAD_TAG_TABLE)
				should(err.message).containEql('获取数据时出现错误')

				err.should.has.property('articles');
				done()
			})
	})
	it('正常获取', done => {
		mover.getSqlArticles(SQLInfomation, TEST_ARTICLE_TABLE, TEST_TAG_TABLE)
			.then(PacheArticleCollection => {
				should(PacheArticleCollection).is.an.Object();
				should(PacheArticleCollection).has.property('articles').is.an.Array();
				should(PacheArticleCollection).has.property('tags').is.an.Array();
				done();
			})
			.catch(err => console.error(err))
	})
})
return ;
describe('老 Pache 的 SQL 集转换为 Pache 2 的格式', function () {
	const articles = [
		{ id: 9,
			title: 'title1',
			type: 'markdown',
			article: '# test',
			format: '<h1>test</h1>',
			time: new Date(2015, 10, 30, 23, 44, 00),
			ltime: new Date(2015, 11, 30, 23, 44, 00)
		},
		{ id: 33,
			title: 'title2',
			type: 'text',
			article: '这是一个文本',
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
			should(article.content).equal(articles[cursor].article)

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
