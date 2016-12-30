const express = require('express');
const utils = require('utility');
const request = require('supertest');


const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const libArticle = require('../lib/article');
const model = require('../model');

const should = require('should');

const JsonHandle = function (fn) {
	return function (err, res) {
		if (err) { throw err }
		let obj = JSON.parse(res.text);
		fn(obj, res);
	};
};
const thunkTestJson = function (app) {
	return function (url, data) {
		return new Promise((resolve, reject) => {
			let requestObj = request(app);
			if (data) {
				requestObj = requestObj.post(url).send(data)
			} else {
				requestObj = requestObj.get(url)
			}
			requestObj.end((err, res) => {
				if (err) { return reject(err) }
				console.log(res.text);
				res.json = JSON.parse(res.text);
				resolve(res);
			})
		});
	};
};
const app = express();
let globalReq = null;
app.use('/', (req, res, next) => {
	globalReq = req;
	next();
});
app.use('/', require('../router/back/api'));

let testJson = thunkTestJson(app);

const JsonMiddle = res => {
	res.json = JSON.parse(res.text);
	return Promise.resolve(res);
}

describe('GET /topic', () => {
	it('get topic', done => {
		let article = null;
		libArticle.insert({title: 'topicTitle'})
			.then(result => article = result)
			.then(() => testJson('/topic'))
			.then(res => {
				should(res.status).equal(200);
				should(res.json.result._id.toString()).equal(article._id.toString());
				should(res.json.result.title).equal(article.title);
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	});
	it('empty topic', done => {
		model.removeCollection('articles')
			.then(() => testJson('/topic'))
			.then(res => {
				should(res.status).equal(404)
				should(res.json.result).equal(null)
				done()
			})
			.catch(err => { console.error(err); throw err })
	})
	it('topic error', done => {
		const oldtopic = libArticle.topic;
		libArticle.topic = function () { return new Promise((resolve, reject) => {
			const err = new Error('topic-error')
			err.stack = '';
			reject(err);
		})};
		testJson('/topic')
			.then(res => {
				should(res.status).equal(500)
				should(res.json.code).is.not.equal(0)
				should(res.json.msg).equal('topic-error')
				libArticle.topic = oldtopic;
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
})

describe('POST /article', () => {
	it('insert a article', done => {
		request(app).post('/article').send({title: 'insertTitle'})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.result.title).equal('insertTitle');
				done();
			})
	})

	it('insert error', done => {
		const oldInsert = libArticle.insert;
		libArticle.insert = function () {
			const err = new Error('insert-error')
			err.stack = '';
			return Promise.reject(err)
		};

		request(app).post('/article').send({title: 'qqq'})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(500);
				should(res.json.code).is.not.equal(0);
				should(res.json.msg).equal('insert-error');
				libArticle.insert = oldInsert;
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
})

describe('DELETE /articles', function () {
	it('remove multi article', done => {
		const ids = [];
		const insert = (obj = {}) => libArticle.insert({});
		const pushId = (result) => ids.push(result._id.toString());
		const insertMiddle = function (result) {
			pushId(result);
			return insert()
		};
		let firstCount = null;
		libArticle.count()
			.then(count => firstCount = count)
			.then(() => insert())
			.then(insertMiddle)
			.then(insertMiddle)
			.then(insertMiddle)
			.then(insertMiddle)
			.then(result => pushId(result))
			.then(() => request(app).delete('/articles').send({ids}))
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
			})
			.then(() => libArticle.count())
			.then(newCount => {
				should(newCount).equal(firstCount)
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

	it('remove single article', done => {
		let insertedId = null;
		libArticle.insert({})
			.then(result => insertedId = result._id.toString())
			.then(() => request(app).delete('/articles').send({ids: insertedId}))
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
			})
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result).equal(null);
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

	it('不发送 ids', done => {
		request(app).delete('/articles').send({})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(400);
				should(res.json.code).is.not.equal(0);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})

	it('remove a nofound article', done => {
		let ids = utils.md5('删除一个不存在的文章').slice(0, 24);
		request(app).delete('/articles').send({ids})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.result.n).equal(0);
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	});

	it('remove error', done => {
		let oldDel = libArticle.del;
		libArticle.del = function () {
			let err = new Error('del-error');
			err.stack = '';
			return Promise.reject(err);
		};
		let ids = '/articles/现在这个id请求是没卵用的';
		request(app).delete('/articles').send({ids})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(500);
				should(res.json.code).not.equal(0);
				should(res.json.msg).equal('del-error');
			})
			.then(() => libArticle.del = oldDel)
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
})

describe('PATCH /article', function () {
	it('mod article', done => {
		let article;
		libArticle.insert({title: 'newTitle'})
			.then((inserted) => {
				article = inserted;
				return request(app).patch(`/article/` + article._id.toString()).send({title: 'modTitle'})
			})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200)
				should(res.json.code).equal(0)
				return libArticle.get(article._id.toString())
			})
			.then(result => {
				should(result._id.toString()).equal(article._id.toString())
				should(result.title).equal('modTitle')
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('mod a article by badId', done => {
		request(app).patch(`/article/badid`).send({})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(500);
				should(res.json.code).is.not.equal(0);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('mod a nofound article', done => {
		request(app).patch(`/article/${utils.md5('不存在的文章').slice(0, 24)}`).send({title: 'new'})
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(404);
				should(res.json.code).is.not.equal(0);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('error', done => {
		let oldMod = libArticle.mod;
		libArticle.mod = function () {
			let err = new Error('mod-error');
			err.stack = '';
			return Promise.reject(err);
		};

		request(app).patch('/article/yyy').send({})
			.then(JsonMiddle)
			.then(res => {
				res.status.should.equal(500);
				should(res.json.code).is.not.equal(0);
				should(res.json.msg).equal('mod-error');
				libArticle.mod = oldMod;
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
})

describe('GET /articles', function () {
	envir.limit = 2;
	it('not page param, they use page "1"', done => {
		model.removeCollection('artiles')
			.catch(() => Promise.resolve())
			.then(() => libArticle.insert({ title: 'pppTitle1' }))
			.then(() => libArticle.insert({ title: 'pppTitle2' }))
			.then(() => libArticle.insert({ title: 'pppTitle3' }))
			.then(() => request(app).get('/articles'))
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.list).is.an.Array();
				should(res.json.list[0].title).equal('pppTitle3');
				should(res.json.list.length).equal(envir.limit);
				done();
			})
			.catch(err => { console.error(err); throw err })
	});
	it('bad page code', done => {
		request(app).get('/articles/badPagecode')
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.list).is.an.Array();
				should(res.json.list[0].title).equal('pppTitle3');
				should(res.json.list.length).equal(envir.limit);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('get "1" page', done => {
		request(app).get('/articles/1')
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.list).is.an.Array();
				should(res.json.list[0].title).equal('pppTitle3');
				should(res.json.list.length).equal(envir.limit);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('get "2" page', done => {
		request(app).get('/articles/2')
			.then(JsonMiddle)
			.then(res => {
				res.status.should.equal(200);
				res.json.code.should.equal(0);
				should(res.json.list).is.an.Array();
				should(res.json.list[0].title).equal('pppTitle1');
				done();
			})
			.catch(err => { console.error(err); throw err })
	});

	it('get artiles error', done => {
		const oldGetlist = libArticle.getlist;
		libArticle.getlist = function () {
			const err = new Error('get-error');
			err.stack = '';
			return Promise.reject(err);
		};
		request(app).get('/articles')
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(500);
				should(res.json.code).is.not.equal(0);
				should(res.json.msg).equal('get-error');
			})
			.then(() => libArticle.getlist = oldGetlist)
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
})

describe('GET /article', function () {
	it('get a article', done => {
		let inserted = null;
		libArticle.insert({})
			.then(result => inserted = result)
			.then(() => request(app).get(`/article/${inserted._id.toString()}`))
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.result).is.an.Object();

				const result = res.json.result;
				result._id.toString().should.equal(inserted._id.toString());
				result.title.should.equal(inserted.title);
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('get no found', done => {
		request(app).get(`/article/${utils.md5('很可能不会存在的文章 id').slice(0, 24)}`)
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(200);
				should(res.json.code).equal(0);
				should(res.json.result).is.not.Object();
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('empty params', done => {
		request(app).get(`/article/`)
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(400);
				should(res.json.code).is.not.equal(0);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})

	it('get error', done => {
		const oldGet = libArticle.get;
		libArticle.get = function () {
			const err = new Error('get-error');
			err.stack = '';
			return Promise.reject(err);
		};
		request(app).get(`/article/bad`)
			.then(JsonMiddle)
			.then(res => {
				should(res.status).equal(500);
				should(res.json.code).is.not.equal(0);
			})
			.then(() => libArticle.get = oldGet)
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
})
