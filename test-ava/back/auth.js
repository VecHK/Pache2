const Koa = require('koa')
const request = require('koa-test')
const supertest = require('supertest')
const agent = app => supertest.agent(app.callback())
const utils = require('utility')
const test = require('ava')

const JsonMiddle = (res) => {
  try {
    res.json = JSON.parse(res.text)
  } catch (e) {
    console.warn('JsonMiddle fail, text:', res.text)
    throw e
  }
  return res
}
supertest.Test.prototype.json = function (expect_status = 200) {
  return this.set('Content-Type', 'application/json')
    .expect(expect_status)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)
}

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

const envir = require('../../envir')
envir.pass = '測試用的哦'

const app = require('../../app-t')

const PREFIX_URL = '/api'

/* 準備環境 */
let ag = null
test.before('準備環境', async t => {
  ag = agent(app)
})

let random_code = null
test('獲取隨機碼', async t => {
  let web = await ag.get(PREFIX_URL + '/auth/random').json(200)

  let {code, msg, result} = web.json
  t.is(code, 0)
  random_code = result
})

test('認證（錯誤的密碼）', async t => {
  let web = await ag.post(PREFIX_URL + '/auth/pass').testJson({
    pass: '這絕對會是錯誤的密碼，朋友',
  }, 200)

  let {code, msg, result} = web.json
  t.is(code, 0)
  t.is(result, false)
})

test('認證（正確的密碼）', async t => {
  const random_web = await ag.get(PREFIX_URL + '/auth/random').then(JsonMiddle)
  const random_code = random_web.json.result

  let web = await ag.post(PREFIX_URL + '/auth/pass').send({
    pass: utils.md5(random_code + envir.pass)
  }).then(JsonMiddle)

  let {code, msg, result} = web.json
  t.is(code, 0)
  t.is(result, true)
})

test('獲取認證狀態（已登錄）', async t => {
  const random_web = await ag.get(PREFIX_URL + '/auth/random').json(200)
  let web = await ag.post(PREFIX_URL + '/auth/pass').testJson({
    pass: utils.md5(random_web.json.result + envir.pass)
  })

  web = await ag.get(PREFIX_URL + '/auth/status').json(200)

  let {code, msg, result} = web.json
  t.is(code, 0)
  t.is(result, true)
})

test('登出', async t => {
  let web = await agent(app).get(PREFIX_URL + '/auth/logout').json(200)

  let {code, msg, result} = web.json
  t.is(code, 0)
  t.is(result, true)
})

test('獲取認證狀態（未登錄）', async t => {
  let web = await agent(app).get(PREFIX_URL + '/auth/status').json(200)

  let {code, msg, result} = web.json
  t.is(code, 0)
  t.is(result, false)
})

test('訪問 admin 模塊（未登錄被拒）', async t => {
  let web = await agent(app).get(PREFIX_URL + '/bucunzai');

  t.is(web.status, 401)
  t.regex(web.text, /需要登錄/)
})
test('訪問 admin 模塊（已認證）', async t => {
  const random_web = await ag.get(PREFIX_URL + '/auth/random').json(200)
  let web = await ag.post(PREFIX_URL + '/auth/pass').testJson({
    pass: utils.md5(random_web.json.result + envir.pass)
  })
  t.is(web.json.result, true)

  web = await ag.get(PREFIX_URL + '/index.html')

  t.not(web.status, 401)
})
