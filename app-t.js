const fs = require('fs')
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
  } catch (error) {
    ctx.status = 500
    await ctx.render('error-page.jade', {
      error,
      npmPackage,
      envir: Object.assign({}, envir),
    })
  }
})

// 是否強制跳轉到主域名
envir.force_redirect_to_master_domain && app.use(async (ctx, next) => {
  if (ctx.host.trim() !== envir.master_domain.trim()) {
    let protocol = envir.force_https ? 'https' : ctx.protocol
    return ctx.redirect(`${protocol}://${envir.master_domain}${ctx.url}`)
  }
  await next()
})

app
  .use(back.routes())
  .use(back.allowedMethods())

app
  .use(front.routes())
  .use(front.allowedMethods())

app.use(async (ctx, next) => {
  if ('/admin' === ctx.path) {
    /* /admin 和 /admin/ 的區別性問題: https://github.com/VecHK/Pache2/issues/2 */
    ctx.redirect('/admin/')
  } else {
    await next()
  }
})

app.use(koa_static(path.join(__dirname, 'static/')))
app.use(koa_static(path.join(__dirname, 'public/')))

const send = require('koa-send');
const cacheControl = require('koa-cache-control')
const ROOT_DIR = __dirname
const IMG_POOL_PATH = envir.IMAGE_PATH || path.join(__dirname, '/img_pool')

app.use(cacheControl({
  // 緩存時間一小時
  maxAge: 5,
}))
app.use(async (ctx, next) => {
  ctx.cacheControl = {
    // 緩存時間一小時
    maxAge: 60 * 60 * 60
  };

  let {dir, base} = path.parse(ctx.path)
  if ('/img-pool' !== dir) {
    return await next()
  } else if (!fs.existsSync(path.join(IMG_POOL_PATH, base))) {
    await next()
  } else {
    await send(ctx, base, { root: IMG_POOL_PATH })
  }
})

envir.ESD_ENABLE && envir.ESD_LIST.forEach(esd_path => {
  app.use(koa_static(path.join(esd_path)))
})

module.exports = app
