const express = require('express');
const utils = require('utility');
const request = require('supertest');

const envir = require('../envir');

const should = require('should');

describe('auth', () => {
	const app = express();
	let globalReq = null;
	app.use('/', (req, res, next) => {
		globalReq = req;
		req.auth_status = false;
		next();
	});
	app.use(require('../app'));
	app.get('/admin/auth_status_test', (req, res) => {
		req.auth_status = true;
		res.end('auth_status_test');
	});

	it('authed should be false', done => {
		request(app).get('/admin/authed').end((err, res) => {
			res.status.should.equal(200);
			JSON.parse(res.text).should.equal(false);
			done();
		})
	})

	let randomCode;
	let cookie;
	it('auth getRandom', (done) => {
		request(app).get('/admin/auth').end(function (err, res) {
			cookie = res.header['set-cookie'];
			res.status.should.equal(200);
			res.text.should.length(16);

			randomCode = res.text;
			done();
		});
	});

	it('auth need randomCode', (done) => {
		request(app)
		.post('/admin/auth')
		.send({ pass: utils.md5(randomCode + envir.pass) })
		.end(function (err, res) {
			res.status.should.equal(403);
			res.text.should.containEql('need randomCode');
			done();
		});
	});

	it('bad pass auth', done => {
		request(app)
			.post('/admin/auth')
			.set('Cookie', cookie)
			.send({ pass: utils.md5(randomCode + envir.pass + 'badPass') })
			.then(res => {
				res.status.should.equal(401);
				done();
			})
	})

	it('pass auth', (done) => {
		request(app)
			.post('/admin/auth')
			.set('Cookie', cookie)
			.send({ pass: utils.md5(randomCode + envir.pass) })
			.expect(200, function (err, res) {
				done();
			});
	});

	it('authed should be true', done => {
		request(app).get('/admin/authed')
		.set('Cookie', cookie)
		.end((err, res) => {
			res.status.should.equal(200);
			JSON.parse(res.text).should.equal(true);
			done();
		})
	})

	it('auth status should be false', done => {
		request(app)
			.get('/admin/auth_status_test')
			.then(res => {
				should(res.status).equal(401);
				should(globalReq.auth_status).equal(false);
				done();
			})
	})
	it('auth status should be true', done => {
		request(app)
			.get('/admin/auth_status_test')
			.set('Cookie', cookie)
			.expect(200, (err, res) => {
				should(globalReq.auth_status).equal(true);
				done();
			})
	})

	it('getRandom after need login', (done) => {
		request(app)
		.get('/admin/auth')
		.set('cookie', cookie)
		.end((err, res) => {
			res.status.should.equal(200);
			res.text.should.length(16);
			randomCode = res.text;

			request(app).get('/admin/authed').set('cookie', cookie).end((err, res) => {
				res.status.should.equal(200);
				JSON.parse(res.text).should.equal(false);
				done();
			})
		})
	});

	it('login out', (done) => {
		request(app)
			.post('/admin/auth')
			.set('Cookie', cookie)
			.send({ pass: utils.md5(randomCode + envir.pass) })
			.end(function (err, res) {
				res.status.should.equal(200);

				request(app)
				.get('/admin/logout')
				.set('Cookie', cookie)
				.end((err, res) => {
					res.status.should.equal(200);

					globalReq.session.should.not.have.property('user');
					done();
				});
			});
	});
})
