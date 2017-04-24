const path = require('path')
const Router = require('koa-router')
const serve = require('koa-static')

const Model = require('../model')
const auth = require('./auth')
const api = require('./api')

const router = new Router

router.use('/api', auth.routes(), auth.allowedMethods())

router.use('/api', api.routes(), api.allowedMethods())

router.get('/admin/preview/:articleid', async (ctx, next) => {
  if (ctx.session.is_login) {
    return await next()
  }

  const article = {
    title: '拒絕',
    format: `
    <div class="page current-page solid-page">
      <div></div>
      <p>admin 賬號未認證或認證過期，請重新認證（這個頁面里沒有這樣的登錄器）</p>
      <p>
        若一直存在這樣的情況（包括無法登錄的情況），有可能是：
        <ul>
          <li>瀏覽器禁用了 Cookie</li>
          <li>Redis 因為不明原因無法連接成功。（重啟 Redis 后也需要重啟 Pache）</li>
        </ul>
      </p>
      <p>或者通報 <a href="https://github.com/VecHK/Pache2/issues/" target="_blank">GitHub issues</a></p>
    </div>`,
    type: 'markdown',
    date: new Date,
    mod: new Date,
  }
  ctx.status = 401
  await ctx.render('article/found', {article}, true)
})
router.get('/admin/preview/:articleid', async (ctx) => {
  let article = await Model.Article.findOne({ _id: ctx.params.articleid });
  if (article) {
    ctx.status = 200;
    await ctx.render('article/found', {article}, true);
  } else {
    ctx.status = 404;
    await ctx.render('article/nofound', {}, true);
  }
})

module.exports = router
