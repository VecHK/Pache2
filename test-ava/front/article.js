const envir = require('../../envir')
const TEST_DB = 'pache_test'
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`
const Model = require('../../model')
const app = require('../../app-t')

const Koa = require('koa')
const request = require('koa-test')
const agent = require('supertest-koa-agent')
const test = require('ava')

test('查找一篇文章', async t => {
  const inserted = await (new Model.Article({title: 'find-article'})).save()
  const result = await agent(app).get(`/article/${inserted._id.toString()}`)

  t.is(result.status, 200)
  t.regex(result.text, new RegExp(`${inserted.title}`))
})


test('找不到文章', async t => {
  const result = await agent(app).get(`/article/aaaacaaaaaaaaaaa44a2518c`)

  t.is(result.status, 404);
})


test('錯誤的請求', async t => {
  const result = await agent(app).get('/article/jjjklji')
  t.is(result.status, 400);
})
