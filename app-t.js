const Koa = require('koa')
const path = require('path')
const views = require('koa-views')
const Router = require('koa-router')
const koa_static = require('koa-static')

const session = require('koa-session-redis')
const convert = require('koa-convert')

const npmPackage = require('./package')
const envir = require('./envir')
const Model = require('./model')

const back = require('./back')
const front = require('./front')

const app = new Koa

app.keys = [envir.session_secret];

const session_handle = convert(session({
  key: 'pache:sess', /** (string) cookie key (default is koa:sess) */
  cookie: {
    maxage: 86400000, // cookie 有效期
    maxAge: 86400000, // cookie 有效期
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
  },
  store: {
    host: process.env.SESSION_PORT_6379_TCP_ADDR || '127.0.0.1',
    port: process.env.SESSION_PORT_6379_TCP_PORT || 6379,
    ttl: 3600,
  },
}))

app.use(session_handle)

app.use(views(path.join(__dirname, 'views-jade'), {
  map: {
    html: 'underscore'
  }
}));

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = 500
    await ctx.render('error-page.jade', {
      error: e,
      envir: Object.assign({}, envir),
      npmPackage,
    })
    // ctx.body = '好像服務器方面出現了偏差: ' + e.message
  }
})

// app.use(async ctx => {
//   ctx.unkno()
// })

// 是否強制跳轉到主域名
envir.force_redirect_to_master_domain && app.use(async (ctx, next) => {
  if (ctx.request.headers['host'].trim() !== envir.master_domain.trim()) {
    let protocol = envir.force_https ? 'https' : ctx.protocol
    return res.redirect(`${protocol}://${envir.master_domain}${ctx.url}`)
  }
  await next()
})

const backRouter = new Router

app
  .use(back.routes())
  .use(back.allowedMethods())

app
  .use(front.routes())
  .use(front.allowedMethods())

app.use(koa_static(path.join(__dirname, 'static/')))
app.use(koa_static(path.join(__dirname, 'public/')))

if (envir.ESD_ENABLE) {
  envir.ESD_LIST.forEach(esd_path => {
    app.use(koa_static(path.join(esd_path)))
  })
}

module.exports = app
