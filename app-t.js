const Koa = require('koa')
const path = require('path')
const views = require('koa-views')
const Router = require('koa-router')
const koa_static = require('koa-static')

const session = require('koa-session-redis')
const convert = require('koa-convert')

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

app.use(session_handle);

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
