const path = require('path');
const Model = require('../../model');
const libCategory = require('../../lib/category');
const libArticle = require('../../lib/article');
const envir = require('../../envir')
const Router = require('koa-router');

const router = new Router;

const views = require('koa-views');

// Must be used before any router is used
router.use(views(path.join(__dirname + '/../../views-jade'), {
  map: {
    html: 'underscore'
  }
}));

router.use(async (ctx, next) => {
  ctx.conditions = {};
  await next()
})

router.get(['*/category/:category/*', '*/category/:category'], async (ctx, next) => {
  // console.log('category!')
  let category = await Model.Category.findOne({ name: ctx.params.category});

  if (category === null) {
    ctx.status = 404;
    ctx.body = '分類不存在'
    return;
  }

  ctx.conditions.category_name = category.name;
  ctx.conditions.category_id = category.id.toString();
  ctx.conditions.category = category;
  await next()
})

router.get(['*/tag/:tag_raw/*', '*/tag/:tag_raw'], async (ctx, next) => {
  // console.log('tag!')
  let tag_arr = ctx.params.tag_raw.split(',').map(tag => tag.trim())
  ctx.conditions.tags = tag_arr;
  await next()
})

router.get('*/:pagecode', async (ctx, next) => {
  let pagecode = parseInt(ctx.params.pagecode)

  if (Number.isInteger(pagecode) && pagecode > 0) {
    ctx.conditions.pagecode = pagecode
  } else if ('tags' in ctx.conditions || 'category' in ctx.conditions) {
    ctx.conditions.pagecode = 1;
  }

  await next()
})

router.get('/', async (ctx, next) => {
  ctx.conditions.pagecode = 1;
  await next();
})

router.get('*', async (ctx, next) => {
  if (!ctx.conditions.pagecode) {
    return await next()
  }
  let con = {
    tags: ctx.conditions.tags,
    category: ctx.conditions.category_id,
    is_draft: {$ne: true},
  }
  let list = await libArticle.find(
    (ctx.conditions.pagecode - 1) * envir.limit,
    envir.limit,
    con
  )
  let count = await libArticle.count(con)
  let categories = await libCategory.getAll()

  ctx.status = 200;
  await ctx.render('home/list.jade', {
    code: 0,
    tags: ctx.conditions.tags,
    limit: envir.limit,
    page: ctx.conditions.pagecode,
    conditions: ctx.conditions,
    categories: categories || [],
    count,
    list,
  }, true);
})

module.exports = router;
