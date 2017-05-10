const path = require('path');
const envir = require('../../envir')
const Model = require('../../model');
const Router = require('koa-router');
const cli = require('../../lib/redis-cache.js')

const router = new Router;

const 合法的文章ID = /^[a-z0-9]{24}$/;
router.get('/:articleid', async (ctx, next) => {
  if (合法的文章ID.test(ctx.params.articleid)) {
    ctx.getConditions = { _id: ctx.params.articleid }
  } else {
    ctx.getConditions = { link_symbol: ctx.params.articleid }
  }
  await next()
})

router.get('/:articleid', async (ctx, next) => {
  let article = await Model.Article.findOne(ctx.getConditions)

  if (article && article.is_draft) {
    ctx.status = 403;
    Object.assign(article, {
      title: '拒絕',
      format: `<div class="page current-page solid-page">
      <div></div>
      <p>你所訪問的這篇文章已經被設置為「草稿」狀態，Pache 不行不能不可以提供。</p>
      <p>
      你或許可以：
      <ul>
        <li>聯繫站長</li>
        <li>看看 WebArchive</li>
        <li>等到有生之年</li>
        <li>使用抽屜型時光機</li>
        <li>發動「リハイハル」或者是「<ruby>運命探知の魔眼<rt>Reading Steiner</rt></ruby>」</li>
        <li>取消收藏/書籤</li>
        <li>對站長實施人身鄙視（不建議）</li>
      </ul>
      </p>`+
      `<pre class="hljs source-code">\n`+
      `<code>文章的一些元數據\n`+
      `文章ＩＤ：${article._id.toString()}\n`+
      `文章標題：${article.title}\n`+
      `文章標籤：${article.tags}\n`+
      `分類ＩＤ：${article.category}\n`+
      `渲染類型：${article.contentType}\n`+
      `創建時間：${article.date.toISOString()}\n`+
      `修改時間：${article.date.toISOString()}\n`+
      `是否轉載：${article.is_repost ? '√' : '×'}\n`+
      `融合顏色：<span style="color: ${article.fusion_color}">${article.fusion_color}</span>\n`+
      `草稿狀態：${article.is_draft ? '√' : '×'}</code></pre>`+
      `</div>`,
      type: 'markdown',
      date: article.date,
      mod: article.mod,
    })
    await ctx.render('article/found', {article}, true);
  } else if (article) {
    ctx.article = article
    await next()
  } else {
    ctx.status = 404;
    await ctx.render('article/nofound', {}, true);
  }
})

router.get('/:articleid', async (ctx, next) => {
  const {header} = ctx.request
  const modProp = 'if-modified-since'
  if (header[modProp] && (header[modProp] === ctx.article.mod.toGMTString())) {
    ctx.status = 304
    return
  }
  await next()
})

envir.PUG_CACHE && router.get('/:articleid', async (ctx, next) => {
  const {article} = ctx
  ctx.status = 200
  const article_mod = (new Date(article.mod)).toISOString()

  if ('_id' in ctx.getConditions) {
    var articleKey = `-${article._id.toString()}`
  } else if ('link_symbol' in ctx.getConditions) {
    var articleKey = `-${article.link_symbol}`
  }
  let cacheKey = `pug-article${articleKey}`

  let cache_time = (await cli.HMGET(cacheKey, 'time')).pop()

  // 是否命中
  if (cache_time === article_mod) {
    let complied = await cli.HMGET(cacheKey, 'complied')
    ctx.body = complied.pop()
  } else {
    await next()
    await cli.HMSET(cacheKey, {
      time: article_mod,
      complied: ctx.body,
    })
    article.link_symbol && await cli.HMSET(`pug-article-${article.link_symbol}`, {
      time: article_mod,
      complied: ctx.body,
    })
  }
})

router.get('/:articleid', async ctx => {
  // 緩存
  ctx.response.set('Last-Modified', ctx.article.mod.toGMTString())
  await ctx.render('article/found', {article: ctx.article}, true)
})


module.exports = router;
