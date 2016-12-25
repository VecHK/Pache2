const express = require('express');
const utils = require('utility');
const request = require('supertest');


const envir = require('../envir');
const TEST_COLLECTION = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_COLLECTION}`;

const mongoose = require('mongoose');

const should = require('should');

describe('getArticles', () => {
	const app = express();
	let globalReq = null;
	app.use('/', (req, res, next) => {
		globalReq = req;
		next();
	});
	app.use('/', require('../app.js'));

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
	it('pass auth', (done) => {
		request(app)
		.post('/admin/auth')
		.set('Cookie', cookie)
		.send({ pass: utils.md5(randomCode + envir.pass) })
		.end(function (err, res) {
			res.status.should.equal(200);
			done();
		});
	});

	let ArticleCount = null;
	it('getArticles', function (done) {
		request(app)
		.get('/admin/api/articles')
		.set('Cookie', cookie)
		.end((err, res) => {
			if (err) { throw err }
			// console.log(res.text);
			let obj = JSON.parse(res.text);

			obj.should.has.property('page').equal(1);
			obj.should.has.property('count').is.an.Number();
			obj.should.has.property('limit').equal(envir.limit);
			obj.should.has.property('list').is.an.Array();

			ArticleCount = obj.count;
			done();
		})
	});
	it('getArticles by pagecode', function (done) {
		request(app)
		.get('/admin/api/articles/2')
		.set('Cookie', cookie)
		.end((err, res) => {
			if (err) { throw err }
			// console.log(res.text);
			let obj = JSON.parse(res.text);

			obj.should.has.property('page').equal(2);
			obj.should.has.property('count').is.an.Number();
			obj.should.has.property('list').is.an.Array();

			ArticleCount = obj.count;
			done();
		})
	});

	let inserted = null;
	it('insert article', done => {
		request(app)
			.post('/admin/api/article')
			.send({
				title: '标题',
				content: '内容',
				contentType: 'markdown',
				tags: [ 'a', 'b', 'c' ],
			})
			.set('Cookie', cookie)
			.end((err, res) => {
				if (err) { throw err; }
				let obj = JSON.parse(res.text);

				obj.should
					.has.property('code').equal(0)
				obj.should
					.has.property('msg').is.an.String();

				inserted = obj.result;

				done();
			});
	});

	it('mod Article', done => {
		request(app)
			.patch(`/admin/api/article/${inserted._id}`)
			.send({
				title: 'new Title',
				content: 'TEXT',
				tags: 'testTag',
				contentType: 'text',
			})
			.expect(200)
			.set('Cookie', cookie)
			.end((err, res) => {
				if (err) throw err;
				console.log(res.text);
				let obj = JSON.parse(res.text);

				obj.should.has.property('code').equal(0);
				obj.should.has.property('msg').is.an.String();
				obj.should.has.property('result').is.an.Object();

				done();
			})
	});

	var topic;
	var modId;
	it('topic', done => {
		request(app)
			.get('/admin/api/topic')
			.set('Cookie', cookie)
			.end((err, res) => {
				if (err) { throw err }

				let obj = JSON.parse(res.text);

				obj.should.has.property('code').equal(0);
				obj.should.has.property('msg').is.an.String();
				obj.should.has.property('result').is.an.Object();

				obj.result.should.has.property('_id')
				obj.result.should.has.property('title')
				obj.result.should.has.property('content')
				obj.result.should.has.property('contentType')
				obj.result.should.has.property('tags').is.an.Array().containEql('testTag').length(1);
				obj.result.should.has.property('date')
				obj.result.should.has.property('mod')

				topic = obj.result;
				modId = obj.result._id;

				topic.date.should.equal(inserted.date)
				topic.mod.should.not.equal(inserted.mod)

				topic.title.should.equal('new Title')
				console.log(topic, modId);
				done();
			})
	});

	it('remove article', done => {
		request(app)
			.delete('/admin/api/articles')
			.send({ids: [modId]})
			.set('Cookie', cookie)
			.end((err, res) => {
				if (err) { throw err }
				let obj = JSON.parse(res.text);

				obj.should.has.property('code').equal(0);
				obj.should.has.property('msg').is.an.String();
				obj.should.has.property('result').is.an.Object();

				return done();
				
				request(app).get('/admin/api/topic').set('Cookie', cookie).end((err, res) => {
					if (err) {throw err};
					let newTopic = JSON.parse(res.text).result;
					console.log('newTopic', newTopic);
					newTopic._id.should.not.equal(modId);
					done();
				})
			})
	})
})
