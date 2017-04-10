const Koa = require('koa')
const path = require('path')
const views = require('koa-views')
const Router = require('koa-router')
const koa_static = require('koa-static')

const session = require('koa-session');
const convert = require('koa-convert');

const envir = require('./envir')
const Model = require('./model')

const back = require('./back')
const front = require('./front')

const app = new Koa

app.keys = [envir.session_secret];
const SESSION_CONFIG = {
  key: 'pache:sess', /** (string) cookie key (default is koa:sess) */
  maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
};
app.use(convert(session(SESSION_CONFIG, app)));

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
