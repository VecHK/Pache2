const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const libArticle = require('../lib/article');
const model = require('../model');

const should = require('should');

describe('removeCollection', () => {
	let result = null
	it('removeCollection', done => {
		libArticle.insert({
			title: '我将会被删除',
			content: '是的，没错',
			contentType: 'text',
			tags: [],
		})
		.then(inserted => {
			resultId = inserted._id;
			return model.removeCollection('articles');
		})
		.then(result => {
			return libArticle.get(resultId);
		})
		.then(getResult => {
			should(getResult).equal(null);
			done();
		})
		.catch(err => { throw err })
	})
})
describe('connect', () => {
	it('正确的连接', done => {
		model.connectStatus.then(done)
	})
})
