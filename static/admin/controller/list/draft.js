define(function (require) {
  const [$, $$] = require('/vools.js')
  const envir = require('src/envir.js')
  const Article = require('model/article.js')
  const List = require('controller/list/list.js')
  const TopButton = require('controller/top-panel.js')
  const PageCode = require('controller/list/pagecode.js')

  const draft_button = TopButton.getElement('draft')
  let 都是草稿文章吗 = false
  List.on('has-checked', () => {
    draft_button.style.display = ''
    都是草稿文章吗 = List.collectCheckedItem().every(c => c.is_draft)

    $(draft_button).text(都是草稿文章吗 ? '取消草稿' : '設為草稿')
  })
  List.on('no-checked', () => {
    draft_button.style.display = 'none'
  })

  TopButton.click('draft', async () => {
    const checked_item = List.collectCheckedItem()
  	const ids = checked_item.map(item => item._id)

    await Article.patchFields(ids, {
      is_draft: 都是草稿文章吗 ? false : true,
    })

    List.render(await Article.list(PageCode.page))
  })
  return {}
})
