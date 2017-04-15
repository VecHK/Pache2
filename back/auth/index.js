const path = require('path')
const Router = require('koa-router')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')
const utils = require('utility')
const envir = require('../../envir')
const randomString = require('../../tools/random-string')
const RANDOM_LENGTH = 16

const router = new Router

router.use(bodyParser())

router.use('/auth/*', async (ctx, next) => {
  ctx.apiBack = {
    code: 0,
    msg: '(缺省)',
    result: null,
  };
  await next()
})

router.get('/auth/random', async (ctx, next) => {
  ctx.session.random = randomString(RANDOM_LENGTH);

  ctx.apiBack.result = ctx.session.random;
  ctx.apiBack.msg = 'ok';

  await next()
})

router.post('/auth/pass', async (ctx, next) => {
  const true_pass = utils.md5(ctx.session.random + envir.pass)
  const body_pass = ctx.request.body.pass

  if (true_pass === body_pass) {
    ctx.session.is_login = true
    ctx.apiBack.result = true
  } else {
    ctx.apiBack.status = 200
    ctx.apiBack.result = false
  }

  await next()
})

router.get('/auth/status', async (ctx, next) => {
  ctx.apiBack.status = 200
  if (ctx.session.is_login) {
    ctx.apiBack.result = true
  } else {
    ctx.apiBack.result = false
  }

  await next()
})

router.get('/auth/logout', async (ctx, next) => {
  if ((delete ctx.session.is_login) && (delete ctx.session.random)) {
    ctx.apiBack.result = true
  } else {
    ctx.apiBack.msg = '莫名其妙的錯誤，session 銷毀失敗'
    ctx.apiBack.result = null
    ctx.apiBack.code = 1
    ctx.status = 500
  }

  await next()
})

router.use('/auth/*', async (ctx, next) => {
  const {apiBack} = ctx
  ctx.type = 'application/json'

  if (apiBack.status)
    ctx.status = apiBack.status
  else if (apiBack.code > 0)
    ctx.status = 500
  else if (apiBack.result)
    ctx.status = 200
  else
    ctx.status = 401

  ctx.body = JSON.stringify(apiBack)
})

router.all('/*', async (ctx, next) => {
  if (!ctx.session.is_login) {
    ctx.status = 401
    ctx.body = '需要登錄'
  } else {
    await next()
  }
})

module.exports = router
