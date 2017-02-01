const utils = require('utility');
const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const model = require('../model');
const libArticle = require('../lib/article');
const libCategory = require('../lib/category');

const should = require('should');

describe('get articles list', allDone => {
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
	it('无条件的列表', function (done) {
		this.timeout(5000);
		libArticle.insert({ title: 'A'})
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
	it('无条件的列表（反序）', function (done) {
		this.timeout(5000);
		model.removeCollection('articles')
			.then(result => should(result).equal(true) && libArticle.insert({ title: 'AAA'}))
			.then(() => libArticle.insert({ title: 'BBB', tags: ['tesTTT']}))
			.then(() => libArticle.insert({ title: 'CCC'}) && libArticle.getlist(1, null, 1))
			.then(list => {
				list[0].title.should.equal('AAA');
				list[1].title.should.equal('BBB');
				list[1].tags.should.containEql('tesTTT');
				return libArticle.getlist(2, null, 1);
			})
			.then(list => {
				list[0].title.should.equal('CCC');
				done();
			})
			.catch(err => { console.error(err); throw err })
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
	it('空标签的列表（反序）', function (done) {
		this.timeout(5000);
		model.removeCollection('articles')
			.then(result => should(result).equal(true))
			.then(() => libArticle.insert({ title: '111', tags: ['我是有标签的'] }))
			.then(() => libArticle.insert({ title: '222' }))
			.then(() => libArticle.insert({ title: '333' }))

			.then(() => libArticle.getlist(1, [], 1))
			.then(list => {
				list[0].tags.should.length(0);
				list[0].title.should.equal('222');
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
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

describe('new articles list', () => {
	envir.limit = 2;
	it('page 必须是整数，并且 page 不能小于 0', () => {
		const values = [0, 9.3, true, false, null, {}, [], NaN, 'string', '1', '2', undefined];
		const promises = values.map(page => new Promise((resolve, reject) => {
			libArticle.list(page)
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
	it('无条件的列表', function (done) {
		this.timeout(5000);
		libArticle.insert({ title: 'A'})
			.then(result => history.push(result) && libArticle.insert({ title: 'B'}))
			.then(result => history.push(result) && libArticle.insert({ title: 'C', tags: ['233']}))
			.then(result => history.push(result) && libArticle.list(1))
			.then(list => {
				list[0].title.should.equal('C');
				list[1].title.should.equal('B');
				return libArticle.list(2);
			})
			.then(list => {
				list[0].title.should.equal('A');
				done();
			})
			.catch(err => { throw err })
	})
	it('无条件的列表（反序）', function (done) {
		this.timeout(5000);
		model.removeCollection('articles')
			.then(result => should(result).equal(true) && libArticle.insert({ title: 'AAA'}))
			.then(() => libArticle.insert({ title: 'BBB', tags: ['tesTTT']}))
			.then(() => libArticle.insert({ title: 'CCC'}) && libArticle.list(1, {}, 1))
			.then(list => {
				list[0].title.should.equal('AAA');
				list[1].title.should.equal('BBB');
				list[1].tags.should.containEql('tesTTT');
				return libArticle.list(2, {}, 1);
			})
			.then(list => {
				list[0].title.should.equal('CCC');
				done();
			})
			.catch(err => { console.error(err); throw err })
	})

	it('空标签的列表', done => {
		history = [];
		libArticle.insert({ title: '10'})
			.then(result => history.push(result) && libArticle.insert({ title: '20'}))
			.then(result => history.push(result) && libArticle.insert({ title: '30', tags: ['233']}))
			.then(result => history.push(result) && libArticle.list(1, {tags: []}))
			.then(list => {
				list[0].tags.should.length(0);
				list[0].title.should.equal('20');
				done();
			})
			.catch(err => { throw err })
	})
	it('空标签的列表（反序）', function (done) {
		this.timeout(5000);
		model.removeCollection('articles')
			.then(result => should(result).equal(true))
			.then(() => libArticle.insert({ title: '111', tags: ['我是有标签的'] }))
			.then(() => libArticle.insert({ title: '222' }))
			.then(() => libArticle.insert({ title: '333' }))

			.then(() => libArticle.list(1, {tags: []}, 1))
			.then(list => {
				list[0].tags.should.length(0);
				list[0].title.should.equal('222');
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

	it('有标签的列表', done => {
		history = [];
		libArticle.insert({ title: '0', tags: ['testTag', '有标签']})
			.then(result => history.push(result) && libArticle.insert({ title: '1' , tags: ['testTag', '有标签']}))
			.then(result => history.push(result) && libArticle.insert({ title: '2' , tags: ['testTag', '有标签']}))
			.then(result => history.push(result) && libArticle.list(1, {tags: ['testTag', '有标签']}))
			.then(list => {
				list.should.length(2);
				list[0].title.should.equal('2');
				/* 换第二页 */
				return libArticle.list(2, {tags: ['testTag', '有标签']});
			})
			.then(list => {
				list.should.length(1);
				list[0].title.should.equal('0');
				done();
			})
			.catch(err => { throw err })
	})
	it('有标签的列表（反序）', done => {
		libArticle.list(1, {tags: ['testTag', '有标签']}, 1)
			.then(list => {
				list[0].title.should.equal('0');
				list[1].title.should.equal('1');
				/* 换第二页 */
				return libArticle.list(2, {tags: ['testTag', '有标签']}, 1);
			})
			.then(list => {
				list[0].title.should.equal('2');
			})
			.then(() => libArticle.del(history.map(article => article._id.toString())))
			.then(delResult => done())
			.catch(err => { throw err })
	})

	it('有分类的列表', function (done) {
		this.timeout(5000);
		let categoryId;
		model.removeCollection('articles').catch(info => { console.warn(info) })
			.then(result => model.removeCollection('categories')).catch(() => {})
			.then(() => libCategory.set('list'))
			.then(result => categoryId = result._id.toString())

			.then(() => libArticle.insert({ title: '111', category: categoryId }))
			.then(() => libArticle.insert({ title: '222' }))
			.then(() => libArticle.insert({ title: '333', category: categoryId }))

			.then(() => libArticle.list(1, {category: categoryId}))
			.then(list => {
				should(list[0].title).equal('333');
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('有分类的列表（反序）', function (done) {
		let categoryId;
		libCategory.get('list')
			.then(result => categoryId = result._id.toString())

			.then(() => libArticle.insert({ title: '111', category: categoryId }))
			.then(() => libArticle.insert({ title: '222' }))
			.then(() => libArticle.insert({ title: '333', category: categoryId }))

			.then(() => libArticle.list(1, {category: categoryId}, 1))
			.then(list => {
				should(list[0].title).equal('111');
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

})

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
	});
	it('错误的参数类型', done => {
		const badTypes = [null, undefined, 2, true, [], 'string']
		const promises = badTypes.map(value => new Promise((resolve, reject) => {
			libArticle.insert(value).catch(() => resolve())
		}))
		Promise.all(promises)
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})

	const compareDate = (t1, t2) => t1.toDateString() === t2.toDateString();
	it('允许自定义 date 字段', done => {
		const date = new Date(2007, 2, 2);

		libArticle.insert({title: 'testDate', date})
			.then(result => {
				compareDate(new Date(result.date), date).should.equal(true);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('错误的 date 字段会被忽略', done => {
		const date = new Date({});

		libArticle.insert({title: 'badDate', date})
			.then(result => {
				compareDate(new Date(result.date), new Date).should.equal(true)
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('允许自定义 mod 字段', done => {
		const mod = new Date(2008, 8, 8);
		libArticle.insert({title: 'testMod', mod})
			.then(result => {
				compareDate(new Date(result.mod), mod).should.equal(true);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('错误的 mod 字段会被忽略', done => {
		const mod = new Date({});
		libArticle.insert({title: 'badMod', mod})
			.then(result => {
				compareDate(new Date(result.mod), new Date).should.equal(true);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})


	it('插入项中的 tags 不是一个数组，则将其转换为数组，并将原项目作为数组的第一项', done => {
		let testItem;
		libArticle.insert({title: 'test', tags: 'test'})
			.then(result => testItem = result)
			.then(() => {
				should(testItem.title).equal('test');
				should(testItem.tags).is.an.Array();
				should(testItem.tags).length(1);
				should(testItem.tags[0]).equal('test');
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('插入后的 contentType 一定是小写的', done => {
		libArticle.insert({content: '<h2>title</h2>', contentType: 'tExT'})
			.then(result => {
				should(result.contentType).equal('text');
				done();
			})
			.catch(err => { console.error(err); throw err})
	})
	it('insert unknown type article', done => {
		libArticle.insert({content: '<h2>title</h2>', contentType: 'uuuuuuuu'})
			.then(result => {
				should(result.format).containEql('unknown')
				should(result.format).containEql('contentType')
				done();
			})
			.catch(err => { console.error(err); throw err})
	})
	it('insert HTML type article', done => {
		libArticle.insert({content: '<h2>title</h2>', contentType: 'html'})
			.then(result => {
				should(result.format).match(/\<h2\>title\<\/h2\>/)
				done();
			})
			.catch(err => { console.error(err); throw err})
	})
	it('insert text type article', done => {
		libArticle.insert({content: '<h2>title</h2>', contentType: 'text'})
			.then(result => {
				should(result.format).containEql('title')
				should(result.format).containEql('&lt;h2&gt;')
				should(result.format).containEql('&lt;/h2&gt;')
				done();
			})
			.catch(err => { console.error(err); throw err})
	})

	it('insert markdown type article', done => {
		libArticle.insert({content: '# title', contentType: 'markdown', tags: ['markdown', 'format']})
			.then(result => {
				should(result.format).match(/\<h1\>title\<\/h1\>/)
				insertedId = result._id.toString();
				done();
			})
			.catch(err => { console.error(err); throw err})
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
	it('empty topic', function () {
		this.timeout(5000);
		model.removeCollection('articles')
			.then(removeResult => libArticle.topic())
			.then(topic => {
				should(topic).should.equal(null);
				done();
			})
			.catch(err => { throw err })
	})
})

describe('modify article', function () {
	it('参数必须要有主键_id', done => {
		libArticle.mod()
			.then(result => {
				console.error(result);
			})
			.catch(err => { err.message.should.equal('need id'); done(); })
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
	it('如果有 content 选项则必须显式地声明 contentType，否则将忽略 content', done => {
		let insertedId;
		libArticle.insert({content: '# title'})
			.then(result => { insertedId = result._id.toString() })
			.then(() => libArticle.mod(insertedId, {content: '# newTitle'}))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result._id.toString()).equal(insertedId)
				should(result.content).equal('# title');
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('更新 markdown', done => {
		let insertedId;
		libArticle.insert({content: '# old'})
			.then(result => { insertedId = result._id.toString() })
			.then(() => libArticle.mod(insertedId, {content: '# newTitle', contentType: 'markdown'}))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result._id.toString()).equal(insertedId)
				should(result.content).equal('# newTitle');
				done();
			})
			.catch(err => { console.error(err); throw err })
	})

	it('contentType 输入时同时也进行了格式化', done => {
		let insertedId;
		libArticle.insert({content: '# title', contentType: 'markdown'})
			.then(result => { insertedId = result._id.toString() })
			.then(() => libArticle.mod(insertedId, {contentType: 'text'}))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result._id.toString()).equal(insertedId)
				should(result.format).is.not.match(/\<h1\>/);
				done();
			})
			.catch(err => { console.error(err); throw err });
	})

	it('标题项', done => {
		let insertedId;
		libArticle.insert({title: 'sourceTitle', content: '# title', contentType: 'markdown'})
			.then(result => { insertedId = result._id.toString() })
			.then(() => libArticle.mod(insertedId, {title: 'newTitle'}))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result._id.toString()).equal(insertedId)
				result.title.should.not.equal('sourceTitle')
				result.title.should.equal('newTitle')
				done();
			})
			.catch(err => { console.error(err); throw err });
	})
	it('标签项', done => {
		let insertedId;
		libArticle.insert({title: 'sourceTitle', content: '# title', contentType: 'markdown'})
			.then(result => { insertedId = result._id.toString() })
			.then(() => libArticle.mod(insertedId, {tags: ['markdown', 'format', 'newTag']}))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result._id.toString()).equal(insertedId)

				result.tags.should.length(3);

				const exceptArr = ['markdown', 'format', 'newTag'];
				exceptArr.forEach((exceptTag, cursor) => {
					result.tags[cursor].should.equal(exceptTag)
				});
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err });
	})
	it('标签项不是数组', done => {
		let insertedId;
		libArticle.insert({title: 'sourceTitle', content: '# title', contentType: 'markdown'})
			.then(result => { insertedId = result._id.toString() })
			.then(() => libArticle.mod(insertedId, {tags: 'no-array'}))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result._id.toString()).equal(insertedId)

				should(result.tags).is.an.Array();
				should(result.tags).length(1);
				should(result.tags[0]).equal('no-array');
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err });
	})
	it('非法的文章 id', done => {
		libArticle.mod('wiwoiuroi', {title: 'new'})
			.catch(err => {
				done();
			})
	})
	it('修改不存在的文章', done => {
		libArticle.mod(utils.md5('不存在的文章id').slice(0, 24), {title: 'new'})
			.catch(err => {
				should(err.message).equal('article no found');
				done();
			})
	})
})

describe('countArticle', function (allDone) {
	it('count all articles', function (done) {
		model.removeCollection('articles')
			.then(removeResult => libArticle.insert({}))
			.then(insertResult => libArticle.insert({tags: ['markdown', 'format']}))
			.then(insertResult => libArticle.count())
			.then(count => {
				should(count).equal(2);
				done();
			})
			.catch(err => { console.error(err); throw err });
	});
	it('count empty tag', function (done) {
		this.timeout(5000);
		model.removeCollection('articles')
			.then(removeResult => libArticle.insert({}))
			.then(insertResult => libArticle.insert({tags: ['markdown', 'format']}))
			.then(insertResult => libArticle.insert({tags: ['otherTag', 'tttqqq']}))
			.then(insertResult => libArticle.insert({tags: ['oneTag']}))
			.then(insertResult => libArticle.count([]))
			.then(count => {
				should(count).equal(1);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('count articles by tag', function (done) {
		libArticle.count(['otherTag'])
			.then(count => {
				should(count).equal(1);
			})
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
});
describe('remove article', function () {
	it('批量删除文章', done => {
		const ids = [];
		let initalCount;
		libArticle.count()
			.then(count => initalCount = count)
			.then(() => libArticle.insert({}))
			.then(result => ids.push(result._id.toString()) && libArticle.insert({}))
			.then(result => ids.push(result._id.toString()) && libArticle.insert({}))
			.then(result => ids.push(result._id.toString()))
			.then(() => libArticle.del(ids))
			.then(result => libArticle.count())
			.then(count => {
				count.should.equal(initalCount);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('传入的 ids 不是数组，则为删除单篇文章', done => {
		let id = null;
		libArticle.insert({})
			.then(result => id = result._id.toString())
			.then(() => libArticle.del(id))
			.then(result => {
				should(result.result.n).equal(1);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})

	it('删除一个不存在的文章', done => {
		libArticle.del([utils.md5('不存在的啦').slice(0, 24)])
			.then(result => {
				should(result.result.n).equal(0)
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
})

describe('get article', function () {
	it('必须要有主键', () => {
		libArticle.get()
			.then(result => { console.error(result) })
			.catch(err => { err.message.should.equal('need id'); done() })
	})
	it('不存在的文章', done => {
		let insertedId;
		libArticle.insert({})
			.then(result => insertedId = result._id.toString())
			.then(() => libArticle.del([insertedId]))
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result).equal(null);
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
	it('获取单个文章', done => {
		let insertedId;
		libArticle.insert({title: '阿妹你看，上帝压狗'})
			.then(result => insertedId = result._id.toString())
			.then(() => libArticle.get(insertedId))
			.then(result => {
				should(result).is.an.Object();
				should(result._id.toString()).equal(insertedId);
				should(result.title).equal('阿妹你看，上帝压狗')
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
})

describe('get all', function () {
	it('get All articles', done => {
		envir.limit = 3;
		const articlesList = [];
		model.removeCollection('articles')
			.then(result => libArticle.insert({}))
			.then(result => articlesList.push(result) && libArticle.insert({}))
			.then(result => articlesList.push(result) && libArticle.insert({}))
			.then(result => articlesList.push(result) && libArticle.insert({}))
			.then(result => articlesList.push(result) && libArticle.insert({}))
			.then(result => articlesList.push(result) && libArticle.insert({}))
			.then(result => articlesList.push(result) && libArticle.insert({}))
			.then(result => articlesList.push(result))
			.then(() => libArticle.getAll())
			.then(collection => {
				should(collection).length(articlesList.length)
				done();
			})
			.catch(err => { console.error(err); throw err })
	})
})
