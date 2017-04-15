define(function (require) {
  const [$, $$] = require('/vools.js')
  const envir = require('src/envir.js')
  const Article = require('model/article.js')
  const List = require('controller/list/list.js')
  const TopButton = require('controller/top-panel.js')
  const PageCode = require('controller/list/pagecode.js')

  const button = TopButton.getElement('repost')
  let 都是轉載文章嗎 = false
  List.on('has-checked', () => {
    button.style.display = ''
    都是轉載文章嗎 = List.collectCheckedItem().every(c => c.is_repost)

    $(button).text(都是轉載文章嗎 ? '取消轉載' : '設為轉載')
  })
  List.on('no-checked', () => {
    button.style.display = 'none'
  })

  TopButton.click('repost', async () => {
    const checked_item = List.collectCheckedItem()
  	const ids = checked_item.map(item => item._id)

    await Article.patchFields(ids, {
      is_repost: 都是轉載文章嗎 ? false : true
    })
    console.warn(PageCode.page)
    List.render(await Article.list(PageCode.page))
  })
  return {}
})
