const path = require('path')
const envir = require('../../envir')

/* 配置測試用的 ESD目錄 */
envir['ESD_ENABLE'] = true;
envir['ESD_LIST'] = [
  path.join(__dirname, './one'),
  path.join(__dirname, './two')
];

const agent = require('supertest-koa-agent')
const test = require('ava')

const app = require('../../app-t')

test('靜態文件 ./static', async t => {
  let web = await agent(app).get('/app-icon-256.png');
  t.regex(web.headers['content-type'], /image/)
  t.regex(web.headers['content-type'], /png/)
})

test('ESD', async t => {
  let web = await agent(app).get('/test.txt')

  t.is(web.status, 200)
  t.notRegex(web.text, /two/)
  t.regex(web.text, /one/)
})
test('ESD（第二級目錄）', async t => {
  let web = await agent(app).get('/two_file.txt')

  t.is(web.status, 200)
  t.regex(web.text, /Hey/)
  t.regex(web.text, /two/)
})
