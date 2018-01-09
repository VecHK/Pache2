function pa_init(fn) {
  if (!window.fn_arr) window.fn_arr = []
  fn_arr.push(fn)
}

/* 入口 */
window.main = async function () {
  for (let cursor = 0; cursor < fn_arr.length; ++cursor) {
    await fn_arr[cursor]()
  }

  try {
    window.layer = Layer.init($$('#article'), $$('#article section.footnotes'))
  } catch (e) {
    $(document.body).css('color', '#CB1B45').text(`【${e.name}】${e.message}
      ${e.stack}`)
  }

  // 防止露陷的 CSS 要刪除掉了
  $('.execable-css').remove()
}
