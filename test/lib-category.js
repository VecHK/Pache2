const utils = require('utility');
const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const model = require('../model');
const libCategory = require('../lib/category');
const libArticle = require('../lib/article');

const should = require('should');
const libCaty = libCategory;

describe('获取分类索引', () => {
	it('查找名字为「newCate」的分类索引', done => {
		libCaty.create({ name: 'newCate' })
		.then(() => libCaty.getByName('newCate'))
		.then(category => {
			should(category).is.an.Object();
			should(category.name).equal('newCate')
			should(category.type).equal('category')
		})
		.then(() => done())
		.catch(err => { console.error(err); throw err })
	})
	it('以不存在的名字名字去得到一个索引', done => {
		libCaty.getByName('不存在的分类名')
		.then(category => {
			should(category).is.not.Object().equal(null)
		})
		.then(() => done())
		.catch(err => { console.error(err); throw err })
	})

	it('获取全部分类索引', done => {
		model.removeCollection('categories')
		.then(() => libCaty.create({ name: 'c0' }))
		.then(() => libCaty.create({ name: 'c1' }))
		.then(() => libCaty.create({ name: 'c2' }))
		.then(() => libCaty.create({ name: 'c3' }))
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
