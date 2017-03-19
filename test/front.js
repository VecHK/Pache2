const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const express = require('express');
const http = require('http');

const model = require('../model');
const libArticle = require('../lib/article');
const libCategory = require('../lib/category');

const request = require('supertest');
const cheerio = require('cheerio');

const should = require('should');

describe('front-list', function () {
	const app = express();
	let globalReq = null;
	app.use('/', (req, res, next) => {
		globalReq = req;
		next();
	});
	app.use('/', require('../app'));

	it('default pagecode', (done) => {
		libArticle.insert({
			title: '首页的测试',
			content: '# title',
			contentType: 'markdown',
			tags: ['Life'],
		})
		.then(result => request(app).get('/'))
		.then(res => {
			res.status.should.equal(200);
			should(res.text).containEql('首页的测试');
			globalReq.con.pagecode.should.equal(1);
			done();
		})
		.catch(err => {
			console.error(err);
			throw err
		})
	});
	it('pagecode', (done) => {
		request(app).get('/4')
		.then(res => {
			res.status.should.equal(200);
			globalReq.con.pagecode.should.equal(4);
			done();
		})
		.catch(err => {
			console.error(err);
			throw err
		})
	});

	it('no pagecode taglist', (done) => {
		request(app).get('/tag/vec, apple, original, javascript')
		.then(res => {
			res.status.should.equal(200);
			globalReq.con.tags.should
				.containEql('vec')
				.containEql('apple')
				.containEql('original')
				.containEql('javascript')

			done();
		})
		.catch(err => {
			console.error(err);
			throw err
		})
	})

	it('has pagecode taglist', (done) => {
		request(app).get('/tag/vec, apple, original, java script/8')
		.then(res => {
			should(res.status).equal(200);
			should(globalReq.con.pagecode).equal(8);
			should(globalReq.con.tags)
				.containEql('vec')
				.containEql('apple')
				.containEql('original')
				.containEql('java script')

			done();
		})
		.catch(err => {
			console.error(err);
			throw err
		})
	})

	it('has tag taglist', done => {
		let result;
		libArticle.insert({
			title: 'testing',
			content: '# title',
			contentType: 'markdown',
			tags: ['Programming'],
		})
		.then(inserted => {
			result = inserted;
			return request(app).get('/tag/Programming')
		})
		.then(res => {
			should(res.status).equal(200)
			should(res.text).containEql(result.title)
			done()
		})
		.catch(err => {
			console.error(err);
			throw err;
		})
	})

	it('has category', done => {
		let category, inserted;
		model.removeCollection('articles').catch(() => {})
		.then(() => model.removeCollection('categories')).catch(() => {})
		.then(() => libCategory.set('categoryList'))
		.then(result => {category = result})
		.then(() => libArticle.insert({
			title: '测试：分类标题',
			category: category._id.toString(),
		}))
		.then(result => {inserted = result})
		.then(() => request(app).get('/category/categoryList'))
		.then(res => {
			should(res.status).equal(200);
			should(res.text).containEql('测试：分类标题')
		})
		.then(() => done())
		.catch(err => {
			console.error(err);
			throw err;
		})
	})

	it('error test', done => {
		const app = express();
		let globalReq = null;
		app.use((req, res, next) => {
			globalReq = req;
			next(new Error('test Error'));
		});
		app.use('/', require('../app'));

		request(app).get('/2').end((err, res) => {
			if (err) { throw err }
			should(res.status).equal(500);
			done();
		})
	})
});

describe('front-article', () => {
	const app = express();
	let globalReq = null;
	app.use('/', (req, res, next) => {
		globalReq = req;
		next();
	});
	app.use('/', require('../app'));

	let inserted = null;
	it('get article', done => {
		libArticle.insert({
			title: '测试的标题',
		}).then(result => new Promise((resolve, reject) => {
			request(app).get(`/article/${result._id.toString()}`).expect(200, (err, res) => {
				if (err) { throw err }
				res.text.should.containEql('测试的标题');
				inserted = result;
				done()
			})
		})).catch(err => { throw err })
	});

	it('article nofound', done => {
		request(app).get('/article/585fff4ac93d301dbc39732c').end(function (err, res) {
			should(res.status).equal(404);
			done();
		});
	})
	it('非法 article id', done => {
		request(app).get('/article/585zzzzzc93d30').end(function (err, res) {
			should(res.status).equal(404);
			done();
		})
	})

});
