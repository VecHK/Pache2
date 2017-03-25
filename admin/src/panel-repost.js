(function (window, document, $) {
  let repost_button = $$('.panel [p-command="repost"]')
  let 都是轉載文章嗎 = false
  list.on('has-checked', () => {
    repost_button.style.display = ''
    都是轉載文章嗎 = list.collectCheckedItem().every(c => c.is_repost)

    $(repost_button).text(都是轉載文章嗎 ? '取消轉載' : '設為轉載')
  })
  list.on('no-checked', () => {
    repost_button.style.display = 'none'
  })

  panel.on('command-repost', () => {
    const checked_item = list.collectCheckedItem()
  	const ids = checked_item.map(item => item._id)

    CORE.patchArticlesFields(ids, {
      is_repost: 都是轉載文章嗎 ? false : true,
    })
  })
})(window, window.document, vools)
