const path = require('path')
const Router = require('koa-router')
const serve = require('koa-static')

const Model = require('../model')
const auth = require('./auth')
const api = require('./api')

const router = new Router

router.use('/api', auth.routes(), auth.allowedMethods())

router.use('/api', api.routes(), api.allowedMethods())


const views = require('koa-views');

// Must be used before any router is used
router.use(views(path.join(__dirname + '/../views-jade'), {
  map: {
    html: 'underscore'
  }
}));
router.get('/admin/preview/:articleid', async ctx => {
  let article = await Model.Article.findOne({ _id: ctx.params.articleid });
  if (article) {
    ctx.status = 200;
    await ctx.render('article/found.jade', {article}, true);
  } else {
    ctx.status = 404;
    await ctx.render('article/nofound.jade', {}, true);
  }
})

module.exports = router
