const Koa = require('koa')
const request = require('koa-test')
const supertest = require('supertest')
const agent = app => supertest.agent(app.callback())
const utils = require('utility')
const test = require('ava')

supertest.Test.prototype.testJson = function (value, status = 200) {
  if (typeof(value) === 'object') {
    value = JSON.stringify(value)
  }
  return this.set('Content-Type', 'application/json')
    .send(value)
    .expect(status)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)
};
supertest.Test.prototype.sendJson = function (value) {
  if (typeof(value) === 'object') {
    value = JSON.stringify(value)
  }
  return this.set('Content-Type', 'application/json')
    .send(value)
};

const envir = require('../../envir')
const TEST_DB = 'pache_test'
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`
envir.limit = 3;
envir.pass = '測試用的哦'

const Model = require('../../model')
const apiRouter = require('../../back/api')
const app = new Koa

app.use(apiRouter.routes(), apiRouter.allowedMethods())

/* 準備環境 */
let ag = null
let inserted_list = []
let delete_ids = null
let topic_article = null
let categories = []
test.before('準備環境', async t => {
  ag = agent(app)

  await Model.connectStatus
  try {
    await Model.removeCollection('articles')
  } catch (_) {}
  try {
    await Model.removeCollection('categories')
  } catch(_) {}

  const category_1 = new Model.Category({name: 'cate_1'})
  const category_2 = new Model.Category({name: 'cate_2'})

  categories = categories.concat([
    await category_1.save(),
    await category_2.save()
  ])

  const d_arts = [
    { title: '我會被刪掉的' },
    { title: '我會被刪掉的' }
  ];
  const delete_article = [];
  for (let art of d_arts) {
    let inserted = await (new Model.Article({
      title: '我會被刪掉的'
    })).save()
    delete_article.push(inserted)
  }
  delete_ids = delete_article.map(a => a._id.toString())

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
    let article_ins = new Model.Article(arts)
    inserted_list.push(await article_ins.save())
  }
  topic_article = inserted_list.slice(-1)
})

/**
  JSON 統一格式
  @param msg 消息
  @param code 返回碼，無錯誤時通常為 0
  @param result 返回的結果

*/
const JsonMiddle = (res) => {
  try {
    res.json = JSON.parse(res.text)
  } catch (e) {
    console.warn('JsonMiddle fail, text:', res.text)
    throw e
  }
  return res
}

test('GET /api/topic', async t => {
  let web = await ag.get('/topic').then(JsonMiddle)

  t.is(web.status, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  t.regex(result.title, /標題六/)
})

test('GET /api/articles/:pagecode', async t => {
  let web = await ag.get('/articles/1').then(JsonMiddle)

  t.is(web.status, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  t.is(Array.isArray(result), true) //是個數組
  t.is(result.length, envir.limit)  //單頁最大限制為 envir.limit

  t.is(result[0].title, '標題六')
  t.is(result[1].title, '標題五')
  t.is(result[2].title, '標題四')
})
test('PATCH /api/article/:id', async t => {
  let patch_article = inserted_list.slice(-1).pop()
  let patch_id = patch_article._id.toString()

  let web = await ag.patch(`/article/${patch_id}`).testJson({
    $push: { tags: {$each: ['index']} }
  })

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  let article = await Model.Article.findOne({ _id: patch_id })
  t.is(article.title, patch_article.title)
  t.is(article.tags.includes('index'), true)
})
test('PATCH /api/articles', async t => {
  let patch_list = inserted_list.slice(-3)
  let patch_list_ids = patch_list.map(art => art._id.toString())

  let web = await ag.patch('/articles').testJson({
    ids: patch_list_ids,
    fields: {
      $push: { tags: {$each: ['Misaka10032', 'Sisters']} }
    }
  })

  t.is(web.status, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  web = await ag.get('/articles/1').then(JsonMiddle)

  web.json.result.forEach(art => {
    t.is(art.tags.includes('Misaka10032'), true)
    t.is(art.tags.includes('Sisters'), true)
  })
})
test('DELETE /api/articles', async t => {
  let web = await ag.delete('/articles').send(delete_ids).then(JsonMiddle)

  t.is(web.status, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  let list = await Model.Article.find()
  list.forEach(a => {
    t.is(delete_ids.includes(a._id.toString()), false)
  })
})

test('GET /api/article/:articleid', async t => {
  const inserted = inserted_list.slice(-1).pop()
  const inserted_id = inserted._id.toString()

  let web = await ag.get(
    `/article/${inserted_id}`
  ).then(JsonMiddle)

  t.is(web.status, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  t.is(result._id.toString(), inserted_id)
})
test('POST /api/article', async t => {
  let web = await ag.post('/article').testJson({
    title: '這是一篇新的文章',
    content: '測試完成後就會被刪除',
    date: new Date(1970),
  })

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  let inserted = await Model.Article.findOne({_id: result._id})

  t.is(result.title, inserted.title)

  await Model.Article.find({ _id: result._id }).remove()
})

test('GET /api/categories', async t => {
  let web = await ag.get('/categories').then(JsonMiddle)

  t.is(web.status, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  const name_list = result.map(r => r.name)

  t.is(name_list.length, 2)
  t.is(name_list.includes('cate_1'), true)
  t.is(name_list.includes('cate_2'), true)
})
test('POST /api/category', async t => {
  const insert_cate = { name: 'new_cate'}
  let web = await ag.post('/category').testJson(insert_cate, 200)

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  const new_cate = await Model.Category.findOne({ _id: result._id})

  t.is(new_cate.name, result.name)

  await new_cate.remove()
})
test('PATCH /api/category/:categoryid', async t => {
  const categories = await Model.Category.find()

  const inserted = categories.slice(-1).pop()
  const inserted_id = inserted._id.toString()

  let web = await ag.patch(`/category/${inserted_id}`).testJson({
    color: '#233'
  })

  let {msg, code, result} = web.json
  t.is(code, 0)
  t.not(msg.length, 0)

  const patched = await Model.Category.findOne({ _id: inserted_id })

  t.is(patched.color, '#233')
})
test('DELETE /api/category/:categoryid', async t => {
  const new_cate = await (new Model.Category({ name: '我會被刪' })).save()
  const new_cate_id = new_cate._id.toString()
  let web = await agent(app).delete(`/category/${new_cate_id}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .then(JsonMiddle);

  const deleted_cate = await Model.Category.findOne({ _id: new_cate_id })

  t.is(deleted_cate, null)
})
