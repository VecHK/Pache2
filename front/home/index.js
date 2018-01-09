const path = require('path')
const Model = require('../../model')
const libCategory = require('../../lib/category')
const libArticle = require('../../lib/article')
const envir = require('../../envir')
const Router = require('koa-router')
const cli = require('../../lib/redis-cache')

// const PugETag = require('../../lib/pug-etag')
// PugETag.ETag

const router = new Router

router.use(async (ctx, next) => {
  ctx.conditions = {}
  await next()
})

router.get(['*/category/:category/*', '*/category/:category'], async (ctx, next) => {
  let category = await Model.Category.findOne({ name: ctx.params.category})

  if (category === null) {
    ctx.status = 404
    ctx.body = '分類不存在'
    return
  }

  ctx.conditions.category_name = category.name
  ctx.conditions.category_id = category.id.toString()
  ctx.conditions.category = category
  await next()
})

router.get(['*/tag/:tag_raw/*', '*/tag/:tag_raw'], async (ctx, next) => {
  let tag_arr = ctx.params.tag_raw.split(',').map(tag => tag.trim())
  ctx.conditions.tags = tag_arr
  await next()
})

router.get([
  '/',
  '/tag/*/',
  '/category/*/',
  '/tag/*/category/*/',
  '/category/*/tag/*/',
], async (ctx, next) => {
  ctx.conditions.pagecode = 1
  await next()
})

router.get([
  '/:pagecode',
  '/tag/*/:pagecode',
  '/category/*/:pagecode',
  '/tag/*/category/*/:pagecode',
  '/category/*/tag/*/:pagecode'
], async (ctx, next) => {
  let pagecode = Number(ctx.params.pagecode)

  if (Number.isInteger(pagecode) && pagecode > 0) {
    ctx.conditions.pagecode = pagecode
  } else if ('tags' in ctx.conditions || 'category' in ctx.conditions) {
    ctx.conditions.pagecode = 1
  }

  await next()
})

router.get('*', async (ctx, next) => {
  if (!ctx.conditions.pagecode) {
    return await next()
  }

  const con = {}
  ctx.con = con
  if (ctx.conditions.tags) {
    con.tags = Array.from(ctx.conditions.tags)
  }
  if (ctx.conditions.category_id) {
    con.category = ctx.conditions.category_id
  }
  con.is_draft = {$ne: true}

  let list = await libArticle.find(
    (ctx.conditions.pagecode - 1) * envir.limit,
    envir.limit,
    con
  )

  if (!Array.isArray(list) || !list.length) {
    ctx.status = 404
    return
  }

  let count = await Model.Article.find(con).count()
  ctx.categories = await libCategory.getAll()

  let cacheKey = `list-${ctx.conditions.pagecode}`
  if (ctx.conditions.category) {
    cacheKey += `-${ctx.conditions.category.name}`
  }
  if (ctx.con.tags) {
    cacheKey += `-${ctx.conditions.tags.join('/')}`
  }

  const cache = envir.PUG_CACHE && await PugCache(ctx, cacheKey, list)
  // 是否命中緩存
  if (cache) {
    ctx.body = cache
  } else {
    await ctx.render('home/list', {
      code: 0,
      tags: ctx.conditions.tags,
      limit: envir.limit,
      page: ctx.conditions.pagecode,
      conditions: ctx.conditions,
      categories: Array.isArray(ctx.categories) ? ctx.categories : [],
      count,
      list,
    }, true)

    envir.PUG_CACHE && await cli.HMSET(cacheKey, {
      timeList: list.map(art => (new Date(art.mod)).toISOString()).join('|'),
      complied: ctx.body,
      path: ctx.path,
    })
  }
})

const toISOString = (d) => (new Date(d)).toISOString()
async function PugCache(ctx, cacheKey, list) {
  let cacheTimeList = (await cli.HMGET(cacheKey, 'timeList')).pop()
  let check_result = false
  if (typeof(cacheTimeList) === 'string') {
    cacheTimeList = cacheTimeList.split('|')

    try {
      check_result = cacheTimeList.every((cache_time, cursor) => {
        return toISOString(cache_time) === toISOString(list[cursor].mod)
      })
    } catch (e) {
      check_result = false
    }
  }

  // 命中 redis 緩存
  if (check_result) {
    return (await cli.HMGET(cacheKey, 'complied')).pop()
  } else {
    return null
  }
}

module.exports = router
