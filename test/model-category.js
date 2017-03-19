const utils = require('utility');
const envir = require('../envir');
const TEST_DB = 'pache_test';
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`;

const model = require('../model');
const libCategory = require('../lib/category');
const libArticle = require('../lib/article');

const should = require('should');
const libCaty = libCategory;

const CategoryModel = model.Category

describe('category model', function () {
  it('长度为 0 的字符串将会抛出错误', done => {
    const category = new CategoryModel({
      name: '',
    });
    category.save().catch(e => done())
  })
  it('错误的类型', done => {
    const category = new CategoryModel({
      name: '',
    });
    model.removeCollection('categories')
    .then(() => category.save())
    .catch(e => {
      should(e.message).containEql('name is not undefined, null')
      return libCaty.set(null)
    })
    .catch(e => {
      should(e.message).containEql('name is not undefined, null')
      done()
    })
  })
  it('重复的分类名', done => {
    const category1 = new CategoryModel({
      name: 'hello',
    });
    const category2 = new CategoryModel({
      name: 'hello',
    });
    category1.save()
    .then(() => category2.save())
    .then(info => { console.error(info); throw new Error('重复执行的分类名') })
    .catch(err => {
      should(err.message).containEql('repeat');
      done()
    })
  })
  it('添加一个链接索引', done => {
    const category = new CategoryModel({
      name: '超链接',
      type: 'link',
      value: { href: 'http://vec.moe' }
    });
    category.save()
    .then(info => {
      should(info.name).equal('超链接')
      should(info.type).equal('link')
      should(info.value.href).equal('http://vec.moe')
      done()
    })
    .catch(err => { console.error(err); throw err })
  })
  it('添加一个文章索引', done => {
    let insertedId;
    libArticle.insert({ title: 'about' })
    .then(insertedArticle => { insertedId = insertedArticle._id.toString() })
    .then(() => {
      const category = new CategoryModel({
        name: 'about',
        type: 'article',
        value: { id: insertedId },
      })
      return category.save()
    })
    .then(info => {
      should(info.name).equal('about')
      should(info.type).equal('article')
      should(info.value.id).equal(insertedId)
    })
    .then(() => done())
    .catch(err => { console.error(err); throw err })
  })
})
