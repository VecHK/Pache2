const express = require('express');
const http = require('http');

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
	app.use('/', require('../router/front'));

	it('default pagecode', (done) => {
		request(app).get('/').end(function (err, res) {
			res.status.should.equal(200);
			globalReq.pagecode.should.equal(1);
			globalReq.tags.should.length(0);
			done();
		});
	});

	it('pagecode', (done) => {
		request(app).get('/4').end(function (err, res) {
			res.status.should.equal(200);
			globalReq.pagecode.should.equal(4);
			globalReq.tags.should.length(0);
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
});

describe('front-article', () => {
	const app = express();
	let globalReq = null;
	app.use('/', (req, res, next) => {
		globalReq = req;
		next();
	});
	app.use('/', require('../router/front'));

	it('article nofound', done => {
		request(app).get('/article/ahghiajgoija89396hnsg89h98h').end(function (err, res) {
			res.status.should.equal(404);
			done();
		});
	})
});
