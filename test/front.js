const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const express = require('express');
const http = require('http');
const libArticle = require('../lib/article');

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
		}).then(result => {
			request(app).get('/').end(function (err, res) {
				res.status.should.equal(200);
				should(res.text).containEql('首页的测试');
				globalReq.pagecode.should.equal(1);
				should(globalReq.tags).equal(null);
				done();
			})
		}).catch(err => {
			throw err;
		})
	});

	it('pagecode', (done) => {
		request(app).get('/4').end(function (err, res) {
			res.status.should.equal(200);
			globalReq.pagecode.should.equal(4);
			should(globalReq.tags).equal(null);
			done();
		});
	});

	it('no pagecode taglist', (done) => {
		request(app).get('/tag/vec, apple,     original, javascript').end(function (err, res) {
			res.status.should.equal(200);
			globalReq.tags.should
				.containEql('vec')
				.containEql('apple')
				.containEql('original')
				.containEql('javascript')

			done();
		});
	})

	it('has pagecode taglist', (done) => {
		request(app).get('/8/tag/vec, apple, original, java script').end(function (err, res) {
			res.status.should.equal(200);
			globalReq.pagecode.should.equal(8);
			globalReq.tags.should
				.containEql('vec')
				.containEql('apple')
				.containEql('original')
				.containEql('java script')

			done();
		});
	})

	it('has tag taglist', done => {
		libArticle.insert({
			title: 'testing',
			content: '# title',
			contentType: 'markdown',
			tags: ['Programming'],
		}).then(result => {
			request(app).get('/tag/Programming').end((err, res) => {
				if (err) { throw err }
				res.status.should.equal(200);
				res.text.should.containEql(result.title)
				done()
			})
		}).catch(err => {
			console.error(err);
			throw err;
		})
	})

	it('error test', done => {
		const app = express();
		let globalReq = null;
		app.use((req, res, next) => {
			globalReq = req;
			Object.defineProperty(req, 'pagecode', {
				get(){return 'a'},
				set(){},
			})
			next();
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

describe('front', allDone => {
	const app = express();
	let globalReq = null;
	app.use('/', (req, res, next) => {
		globalReq = req;
		next();
	});
	app.use('/', require('../app'));
	it('404', done => {
		request(app).get('/dnnnnnnnnnnnnnnnnnnnn').end((err, res) => {
			if (err) { throw err }
			should(res.status).equal(404);
			done();
		})
	})
})
