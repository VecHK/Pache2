const envir = require('../../envir')
const TEST_DB = 'pache_home_test'
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`
envir.limit = 3;
const Model = require('../../model')
// const request = require('supertest')

const Koa = require('koa')
const request = require('koa-test')
const agent = require('supertest-koa-agent')
const app = require('../../app-t')
const test = require('ava')

test.before('準備環境', async t => {
  await Model.connectStatus
  try {
    await Model.removeCollection('articles')
  } catch (_) {}
  try {
    await Model.removeCollection('categories')
  } catch(_) {}

  const category_1 = new Model.Category({name: 'cate_1'})
  const category_2 = new Model.Category({name: 'cate_2'})
  await category_1.save();
  await category_2.save();

  const article_list = [
    {title: '標題一', category: category_1._id.toString(), tags: ['java', 'python', 'public']},
    {title: '標題二', category: category_1._id.toString(), tags: ['torzo', 'public']},
    {title: '標題三', category: category_1._id.toString(), tags: ['pache', 'oop', 'public']},

    {title: '標題四', category: category_2._id.toString(), tags: ['durzo', 'osb', 'public']},
    {title: '標題五', category: category_2._id.toString(), tags: ['魔術', 'ability', 'fff']},
    {title: '標題六', category: category_2._id.toString(), tags: ['pache', 'iptp', 'fff']}
  ];
  const p_arr = [];
  for (let arts of article_list) {
    let article_ins = new Model.Article(arts);
    await article_ins.save()
  }
})

test('頁碼（第一頁）', async t => {
  let web = await agent(app).get('/1');

  t.is(web.status, 200)
  t.regex(web.text, /標題六/)
  t.regex(web.text, /標題五/)
  t.regex(web.text, /標題四/)
})
test('頁碼（第二頁）', async t => {
  let web = await agent(app).get('/2');

  t.is(web.status, 200)
  t.regex(web.text, /標題三/)
  t.regex(web.text, /標題二/)
  t.regex(web.text, /標題一/)
})

test('分類（分類1）', async t => {
  var web = await agent(app).get('/category/cate_1')

  t.is(web.status, 200)
  t.regex(web.text, /標題三/)
  t.regex(web.text, /標題二/)
  t.regex(web.text, /標題一/)
})
test('分類（分類2）', async t => {
  const web = await agent(app).get('/category/cate_2')
  t.is(web.status, 200)
  t.regex(web.text, /標題六/)
  t.regex(web.text, /標題五/)
  t.regex(web.text, /標題四/)
})

test('標籤', async t => {
  const web = await agent(app).get(`/tag/${encodeURIComponent('魔術')}`)

  t.is(web.status, 200)
  t.regex(web.text, /標題五/)
})
test('復合標籤', async t => {
  const web = await agent(app).get('/tag/java, python')
  t.is(web.status, 200)
  t.regex(web.text, /標題一/)
})
test('標籤（換頁）', async t => {
  const web = await agent(app).get('/tag/public/2')

  t.is(web.status, 200)
  t.regex(web.text, /標題一/)
})

test('標籤 + 分類', async t => {
  const web = await agent(app).get('/tag/pache/category/cate_1')
  t.is(web.status, 200)
  t.regex(web.text, /標題三/)

  t.notRegex(web.text, /標題二/)
  t.notRegex(web.text, /標題一/)

  t.notRegex(web.text, /標題六/)
})
test('分類 + 標籤', async t => {
  const web = await agent(app).get('/category/cate_1/tag/pache')
  t.is(web.status, 200)
  t.regex(web.text, /標題三/)

  t.notRegex(web.text, /標題二/)
  t.notRegex(web.text, /標題一/)

  t.notRegex(web.text, /標題六/)
})
