const envir = require('../../envir')
const Model = require('../../model')
const libArticle = require('../../lib/article')

const Router = require('koa-router')

const router = new Router

router.get('/topic', async (ctx, next) => {
  const result = await Model.Article.findOne().sort({date: -1})

  Object.assign(ctx.apiBack, {
    msg: 'ok',
    result
  })

  await next()
})

router.get('/articles/:pagecode', async (ctx, next) => {
  let pagecode = parseInt(ctx.params.pagecode)

  if (!(Number.isInteger(pagecode) && pagecode > 0)) {
    pagecode = 1
  }

  let list = await libArticle.list(pagecode, {})

  let {apiBack} = ctx;

  if (Array.isArray(list)) {
    const count = await libArticle.count()
    Object.assign(apiBack, {
      result: list,
      count,
      countPage: Math.ceil(count / envir.limit),
      msg: 'ok',
    })
  } else {
    Object.assign(apiBack, {
      code: -1,
      result: [],
      msg: 'list 並不是數組，已使用缺省值替換',
    })
  }

  await next()
})

router.patch('/article/:id', async (ctx, next) => {
  let {id} = ctx.params
  let fields = ctx.request.body
  Object.assign(fields, { mod: new Date })

  let apiBack = ctx.apiBack
  apiBack = await Model.Article.update(
    { _id: id },
    fields
  )
  apiBack.msg = 'ok'

  await next()
})
router.patch('/articles', async (ctx, next) => {
  let {ids, fields} = ctx.request.body
  Object.assign(fields, { mod: new Date })

  let {apiBack} = ctx
  apiBack.result = await Model.Article.update(
    { _id: {$in: ids} },
    fields,
    { multi: true }
  )
  apiBack.msg = 'ok'

  await next()
})

router.delete('/articles', async (ctx, next) => {
  let ids = ctx.request.body

  let apiBack = ctx.apiBack

  if (!Array.isArray(ids)) {
    apiBack.result = null
    apiBack.msg = 'ids 不是一個數組'
    apiBack.status = 400
    apiBack.code = 1
  } else {
    apiBack.result = await Model.Article.find({
      _id: {$in: ids}
    }).remove()
    apiBack.msg = 'ok'
  }

  await next()
})

router.get('/article/:articleid', async (ctx, next) => {
  let art = await Model.Article.findOne({
    _id: ctx.params.articleid
  })

  let apiBack = ctx.apiBack
  if (art) {
    apiBack.result = art
    apiBack.msg = 'ok'
  } else {
    ctx.status = 404
    apiBack.code = -1
    apiBack.msg = 'no found'
  }

  await next()
})

router.post('/article', async (ctx, next) => {
  let art = ctx.request.body
  let apiBack = ctx.apiBack

  if ('_id' in art) {
    apiBack.code = 1
    apiBack.msg = '請求實體中存在「_id」屬性'
  } else {
    const new_article = new Model.Article(art)
    apiBack.result = await new_article.save()
    apiBack.msg = 'ok'
  }

  await next()
})

module.exports = router
