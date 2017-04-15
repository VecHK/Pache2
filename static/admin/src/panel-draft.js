(function (window, document, $) {
  let draft_button = $$('.panel [p-command="draft"]')
  let 都是草稿文章吗 = false
  list.on('has-checked', () => {
    draft_button.style.display = ''
    都是草稿文章吗 = list.collectCheckedItem().every(c => c.is_draft)

    $(draft_button).text(都是草稿文章吗 ? '取消草稿' : '設為草稿')
  })
  list.on('no-checked', () => {
    draft_button.style.display = 'none'
  })

  panel.on('command-draft', () => {
    const checked_item = list.collectCheckedItem()
  	const ids = checked_item.map(item => item._id)

    CORE.patchArticlesFields(ids, {
      is_draft: 都是草稿文章吗 ? false : true,
    })
  })
})(window, window.document, vools)
