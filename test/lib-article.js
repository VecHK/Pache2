const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const model = require('../model');
const libArticle = require('../lib/article');

const should = require('should');

describe('get articles list', done => {
	envir.limit = 2;
	it('page 必须是整数，并且 page 不能小于 0', () => {
		const values = [0, 9.3, true, false, null, {}, [], NaN, 'string', '1', '2', undefined];
		const promises = values.map(value => new Promise((resolve, reject) => {
			libArticle.getlist(value)
				.then(result => reject())
				.catch(err => {
					err.should.equal('page must be Integer and greater or equal to 1');
					resolve();
				})
		}));
		Promise.all(promises)
			.then(result => { done() })
			.catch(err => { throw err })
	});

	let history = [];
	it('无条件的列表', done => {
		model.removeCollection('articles')
			.then(() => libArticle.insert({ title: 'A'}))
			.then(result => history.push(result) && libArticle.insert({ title: 'B'}))
			.then(result => history.push(result) && libArticle.insert({ title: 'C', tags: ['233']}))
			.then(result => history.push(result) && libArticle.getlist(1))
			.then(list => {
				list[0].title.should.equal('C');
				list[1].title.should.equal('B');
				return libArticle.getlist(2);
			})
			.then(list => {
				list[0].title.should.equal('A');
				done();
			})
			.catch(err => { throw err })
	})
	it('无条件的列表（反序）', done => {
		libArticle.getlist(1, null, 1)
			.then(list => {
				list[0].title.should.equal('A');
				list[1].title.should.equal('B');
				return libArticle.getlist(2, null, 1);
			})
			.then(list => {
				list[0].title.should.equal('C');
				return libArticle.del(history.map(article => article._id.toString()))
			})
			.then(delResult => done())
			.catch(err => { throw err })
	})

	it('空标签的列表', done => {
		history = [];
		libArticle.insert({ title: '10'})
			.then(result => history.push(result) && libArticle.insert({ title: '20'}))
			.then(result => history.push(result) && libArticle.insert({ title: '30', tags: ['233']}))
			.then(result => history.push(result) && libArticle.getlist(1, []))
			.then(list => {
				list[0].tags.should.length(0);
				list[0].title.should.equal('20');
				done();
			})
			.catch(err => { throw err })
	})
	it('空标签的列表（反序）', done => {
		libArticle.getlist(1, [], 1)
			.then(list => {
				list[0].tags.should.length(0);
				list[0].title.should.equal('10');
			})
			.then(() => libArticle.del(history.map(article => article._id.toString())))
			.then(delResult => done())
			.catch(err => { throw err })
	})

	it('有标签的列表', done => {
		history = [];
		libArticle.insert({ title: '0', tags: ['testTag', '有标签']})
			.then(result => history.push(result) && libArticle.insert({ title: '1' , tags: ['testTag', '有标签']}))
			.then(result => history.push(result) && libArticle.insert({ title: '2' , tags: ['testTag', '有标签']}))
			.then(result => history.push(result) && libArticle.getlist(1, ['testTag', '有标签']))
			.then(list => {
				list.should.length(2);
				list[0].title.should.equal('2');
				/* 换第二页 */
				return libArticle.getlist(2, ['testTag', '有标签']);
			})
			.then(list => {
				list.should.length(1);
				list[0].title.should.equal('0');
				done();
			})
			.catch(err => { throw err })
	})
	it('有标签的列表（反序）', done => {
		libArticle.getlist(1, ['testTag', '有标签'], 1)
			.then(list => {
				list[0].title.should.equal('0');
				list[1].title.should.equal('1');
				/* 换第二页 */
				return libArticle.getlist(2, ['testTag', '有标签'], 1);
			})
			.then(list => {
				list[0].title.should.equal('2');
			})
			.then(() => libArticle.del(history.map(article => article._id.toString())))
			.then(delResult => done())
			.catch(err => { throw err })
	})
});

let insertedId;
let defaultArticleId;
describe('insertArticle', function () {
	it('insert default article', done => {
		model.removeCollection('articles')
		.then(result => libArticle.insert({tags: [ 'default' ]}))
		.then(result => {
			should(result.title).equal('(title)')
			should(result.content).equal('(empty)')
			should(result.contentType).equal('text')
			defaultArticleId = result._id.toString();
			done()
		})
		.catch(err => { throw err })
	})
	it('insert markdown article', done => {
		libArticle.insert({content: '# title', contentType: 'markdown', tags: ['markdown', 'format']})
		.then(result => {
			should(result.format).match(/\<h1\>title\<\/h1\>/)
			insertedId = result._id.toString();
			done();
		})
	})
});

describe('topic', function () {
	it('topic article', done => {
		libArticle.topic()
		.then(result => {
			insertedId.should.equal(result._id.toString());
			done();
		})
		.catch(err => { throw err })
	});
});

describe('modify article', function () {
	it('参数必须要有主键_id', done => {
		should(function () {
			libArticle.mod().then(result => {
				console.error(result);
				throw result
			})
		}).throw('need id')
		done();
	})
	it('第二个参数必须是对象', done => {
		const articleValues = [[], null, undefined, 3, 0.8, false, 'string'];
		const promises = articleValues.map(
			articleValue => new Promise((resolve, reject) => {
				libArticle.mod(insertedId, articleValue)
				.then(reject)
				.catch(err => {
					err.message.should.equal('article must be a Object');
					resolve();
				})
			})
		);
		Promise.all(promises)
			.then(result => done())
			.catch(err => { throw err })
	})
	it('如果有 content 选项则必须显式地声明 contentType', done => {
		libArticle.mod(insertedId, {content: '# markdown title'})
		.then(result => libArticle.topic())
		.then(topic => {
			should(topic._id.toString()).equal(insertedId);
			should(topic.content).is.not.equal('# markdown title');
			done();
		})
		.catch(err => { throw err });
	})
	it('contentType 输入时同时也进行了格式化', done => {
		libArticle.mod(insertedId, {contentType: 'text'})
		.then(result => libArticle.topic())
		.then(topic => {
			should(topic._id.toString()).equal(insertedId);
			should(topic.format).is.not.match(/\<h1\>title\<\/h1\>/);
			done();
		})
		.catch(err => { throw err });
	})
	it('标题项', done => {
		libArticle.mod(insertedId, {title: 'a'})
			.then(result => libArticle.topic())
			.then(topic => {
				should(topic._id.toString()).equal(insertedId)
				topic.title.should.equal('a')
				done()
			})
			.catch(err => { throw err })
	})
	it('标签项', done => {
		libArticle.mod(insertedId, {tags: ['markdown', 'format', 'newTag']})
			.then(result => libArticle.topic())
			.then(topic => {
				should(topic._id.toString()).equal(insertedId)
				topic.tags.should.length(3);

				['markdown', 'format', 'newTag'].forEach(exceptTag => {
					topic.tags.should.containEql(exceptTag);
				});

				done()
			})
			.catch(err => { throw err })
	})
})

describe('countArticle', function () {
	it('count all articles', done => {
		libArticle.count()
		.then(result => {
			should(result).equal(2);
			done();
		})
		.catch(err => { throw err });
	});
	it('count articles by tag', done => {
		libArticle.count(['markdown', 'format'])
		.then(result => {
			should(result).equal(1);
			done();
		})
		.catch(err => { throw err })
	})
});

describe('del article', function () {
	it('参数不是数组的时候应该返回 Promise.catch', done => {
		const values = [{}, null, NaN, 99, 9.9, true, undefined, 'string', function () {}];
		const promises = values.map(value => new Promise((resolve, reject) => {
			libArticle.del(value)
				.then(result => reject(result))
				.catch(err => {
					err.message.should.equal('ids is no Array');
					resolve();
				})
		}))
		Promise.all(promises)
			.then(result => done())
			.catch(err => { throw err });
	})
	it('批量删除文章', done => {
		const ids = [];
		let initalCount;
		libArticle.count()
			.then(count => initalCount = count)
			.then(() => libArticle.insert({}))
			.then(result => ids.push(result._id.toString()) && libArticle.insert({}))
			.then(result => ids.push(result._id.toString()) && libArticle.insert({}))
			.then(result => ids.push(result._id.toString()) && libArticle.del(ids))
			.then(result => libArticle.count())
			.then(count => {
				count.should.equal(initalCount);
				done();
			})
			.catch(err => { throw err })
	})
})

describe('get article', function () {
	it('必须要有主键', () => {
		should(() => libArticle.get()).throw('need id');
	})

	it('不存在的文章', done => {
		libArticle.get(insertedId)
		.then(result => {
			should(result._id.toString()).equal(insertedId);
			done();
		})
		.catch(err => { throw err })
	})
	it('获取单个文章', done => {
		libArticle.get(insertedId)
		.then(result => {
			should(result._id.toString()).equal(insertedId);
			done();
		})
		.catch(err => { throw err })
	})
})
