const Model = require('../../model')
const libCategory = require('../../lib/category')

const Router = require('koa-router')

const router = new Router

router.get('/categories', async (ctx, next) => {
  const {apiBack} = ctx
  apiBack.result = await libCategory.getAll()

  if (apiBack.result) {
    apiBack.msg = 'ok'
  } else {
    apiBack.code = -1
    apiBack.result = []
    apiBack.msg = '沒有標籤'
  }

  await next()
})
router.post('/category', async (ctx, next) => {
  const {apiBack} = ctx
  const cat = ctx.request.body
  const new_cate = new Model.Category(cat)

  apiBack.result = await new_cate.save()
  apiBack.msg = 'ok'

  await next()
})
router.patch('/category/:categoryid', async (ctx, next) => {
  const {apiBack} = ctx
  const id = ctx.params.categoryid
  const patch_obj = ctx.request.body

  apiBack.result = await Model.Category.update(
    { _id: id },
    patch_obj
  )
  apiBack.msg = 'ok'

  await next()
})
router.delete('/category/:categoryid', async (ctx, next) => {
  const {apiBack} = ctx
  const id = ctx.params.categoryid

  apiBack.result = await Model.Category.findOne({ _id: id }).remove()
  apiBack.msg = 'ok'

  await next()
})

module.exports = router
