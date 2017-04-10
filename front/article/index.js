const path = require('path');
const Model = require('../../model');
const Router = require('koa-router');

const router = new Router;

const views = require('koa-views');

// Must be used before any router is used
router.use(views(path.join(__dirname + '/../../views-jade'), {
  map: {
    html: 'underscore'
  }
}));

const 合法的文章ID = /^[a-z0-9]{24}$/;
router.get('/:articleid', async (ctx, next) => {
  if (!合法的文章ID.test(ctx.params.articleid)) {
    ctx.status = 400;
    ctx.body = 'bad request';
  } else {
    await next()
  }
})

router.get('/:articleid', async (ctx, next) => {
  let article = await Model.Article.findOne({ _id: ctx.params.articleid });
  if (article) {
    ctx.status = 200;
    await ctx.render('article/found.jade', {article}, true);
  } else {
    ctx.status = 404;
    await ctx.render('article/nofound.jade', {}, true);
  }
})

module.exports = router;
