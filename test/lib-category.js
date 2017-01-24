const utils = require('utility');
const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const model = require('../model');
const libCategory = require('../lib/category');
const libArticle = require('../lib/article');

const should = require('should');
const libCaty = libCategory;

describe('添加分类索引', () => {
	it('添加一个分类索引', done => {
		model.removeCollection('categories')
			.catch(() => Promise.resolve())
			.then(() => libCaty.set('hello'))
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

	it('重复的分类名', done => {
		libCaty.set('hello')
			.then(info => { console.error(info); throw new Error('重复执行的分类名') })
			.catch(err => {
				should(err.message).containEql('repeat');
				done()
			})
	})

	it('添加一个链接索引', done => {
		libCaty.set('超链接').as.link({ href: 'http://vec.moe' })
			.then(info => {
				should(info.name).equal('超链接')
				should(info.type).equal('link')
				should(info.value.href).equal('http://vec.moe')
				done()
			})
			.catch(err => { console.error(err); throw err })
	})
	it('添加一个文章索引', done => {
		let insertedId;
		libArticle.insert({ title: 'about' })
			.then(insertedArticle => { insertedId = insertedArticle._id.toString() })
			.then(() => libCaty.set('about').as.article(insertedId))
			.then(info => {
				should(info.name).equal('about')
				should(info.type).equal('article')
				should(info.value).equal(insertedId)
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
})

describe('获取分类索引', () => {
	it('以名字得到一个已存在索引', done => {
		libCaty.set('newCate').as.category()
			.then(() => libCaty.get('newCate'))
			.then(category => {
				should(category).is.an.Object();
				should(category.name).equal('newCate')
				should(category.type).equal('category')
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('以不存在的名字名字去得到一个索引', done => {
		libCaty.get('不存在的分类名')
			.then(category => {
				should(category).is.not.Object().equal(null)
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

	it('获取全部分类索引', done => {
		model.removeCollection('categories')
			.then(() => libCaty.set('c0').as.category())
			.then(() => libCaty.set('c1').as.category())
			.then(() => libCaty.set('c2').as.category())
			.then(() => libCaty.set('c3').as.category())
			.then(result => libCaty.getAll())
			.then(list => {
				should(list[0].name).equal('c0')
				should(list[1].name).equal('c1')
				should(list[2].name).equal('c2')
				should(list[3].name).equal('c3')
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
})
