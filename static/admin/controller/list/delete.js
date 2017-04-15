define(function (require) {
  const [$, $$] = require('/vools.js')
  const envir = require('src/envir.js')
  const Article = require('model/article.js')
  const List = require('controller/list/list.js')
  const TopButton = require('controller/top-panel.js')
  const PageCode = require('controller/list/pagecode.js')

  const delete_button = TopButton.getElement('delete')

  List.on('has-checked', () => {
    delete_button.style.display = ''
  })
  List.on('no-checked', () => {
    delete_button.style.display = 'none'
  })
  TopButton.click('delete', async () => {
    const checked_item = List.collectCheckedItem()
    const ids = checked_item.map(item => item._id)

    if (window.confirm('你確定要刪除？')) {
      await Article.remove(ids)
      List.render(await Article.list(PageCode.page))
    }
  })
  return {}
})
