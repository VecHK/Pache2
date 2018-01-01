const fs = require('mz/fs')
const Koa = require('koa')
const path = require('path')
const Views = require('koa-pug')
const Router = require('koa-router')
const convert = require('koa-convert')
const compress = require('koa-compress')
const koa_static = require('koa-static')
const pache_static = require('./lib/pache-static')
const koa_session = require('koa-session-redis')

const npmPackage = require('./package')
const envir = require('./envir')
const Model = require('./model')

const back = require('./back')
const front = require('./front')

const app = new Koa

var aliasObj
if (envir.ALIAS_CONFIG_FILE) {
  let file
  try {
    file = fs.readFileSync(envir.ALIAS_CONFIG_FILE).toString()
    aliasObj = JSON.parse(file)
  } catch (e) {
    console.warn(`Pache alias 錯誤，請檢查 alias 文件('${envir.ALIAS_CONFIG_FILE}')是否存在，或者是否是合法的 JSON`)
    process.exit(-1)
  }
  app.use(async (ctx, next) => {
    const host = ctx.host.replace(/:([0-9])*$/, '')
    const portString = ctx.host.replace(host, '') // :xxx

    // 如果域名存在于 alias 中
    if (host in aliasObj) {
      return ctx.redirect(`${ctx.protocol}://${aliasObj[host]}${portString}${ctx.url}`)
    } else {
      await next()
    }
  })
} else {
  aliasObj = {}
}

app.keys = [envir.session_secret];

const session_handle = convert(koa_session({
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

const GZIPMIME = /text|application|json|javascript/i
if (envir.GZIP_ENABLE) {
  app.use(compress({
    filter: GZIPMIME.test.bind(GZIPMIME),
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }))
}

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    ctx.status = 500
    await ctx.render('error-page', {
      error,
      npmPackage,
      envir: Object.assign({}, envir),
    })
  }
})

// 是否強制跳轉到主域名
envir.force_redirect_to_master_domain && app.use(async (ctx, next) => {
  console.warn(ctx.hostname, envir.master_domain)
  if (ctx.hostname.trim() !== envir.master_domain.trim()) {
    let protocol = envir.force_https ? 'https' : ctx.protocol
    let port = envir.force_https ? envir.https_port : envir.port
    return ctx.redirect(`${protocol}://${envir.master_domain}:${envir.port}${ctx.url}`)
  }
  await next()
})

app.use(async (ctx, next) => {
  if ('/admin' === ctx.path) {
    /* /admin 和 /admin/ 的區別性問題: https://github.com/VecHK/Pache2/issues/2 */
    ctx.redirect('/admin/')
  } else {
    await next()
  }
})

// app.use(koa_static(path.join(__dirname, 'static/')))
app.use(pache_static({
  path: path.join(__dirname, 'static/'),

  enable_modified_cache: true,
}))

// app.use(koa_static(path.join(__dirname, 'public/')))
app.use(pache_static({
  path: path.join(__dirname, 'public/'),

  enable_modified_cache: true,
}))


const pug = new Views({
  viewPath: path.join(__dirname, '/views'),
  app,
})

app
  .use(front.routes())
  .use(front.allowedMethods())

app
  .use(back.routes())
  .use(back.allowedMethods())

const send = require('koa-send');
const cacheControl = require('koa-cache-control')
const ROOT_DIR = __dirname
const IMG_POOL_PATH = envir.IMAGE_PATH || path.join(__dirname, '/img_pool')

app.use(async (ctx, next) => {
  let {dir, base} = path.parse(ctx.path)
  const filePath = path.join(IMG_POOL_PATH, base)
  if ('/img-pool' !== dir) {
    await next()
  } else if (!await fs.exists(filePath)) {
    await next()
  } else {
    const mod_time = (await fs.stat(filePath)).mtime.toGMTString()
    const {header} = ctx.request
    const modProp = 'if-modified-since'
    if (header[modProp] && (header[modProp] === mod_time)) {
      ctx.status = 304
      return
    } else {
      ctx.response.set('Last-Modified', mod_time)
      await send(ctx, base, { root: IMG_POOL_PATH })
    }
  }
})
envir.ESD_ENABLE && app.use(async (ctx, next) => {
  for (let esd_path of envir.ESD_LIST) {
    const filePath = path.join(esd_path, decodeURIComponent(ctx.path))
    if (await fs.exists(filePath)) {
      const {dir, base} = path.parse(filePath)
      await send(ctx, base, { root: dir })
      return
    }
  }
  await next()
})

module.exports = app
