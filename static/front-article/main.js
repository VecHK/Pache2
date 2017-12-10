function pa_init(fn) {
  if (!window.fn_arr) window.fn_arr = []
  fn_arr.push(fn)
}

/* 入口 */
window.main = async function () {
  for (let cursor = 0; cursor < fn_arr.length; ++cursor) {
    await fn_arr[cursor]()
  }

  // 防止露陷的 CSS 要刪除掉了
  $('.execable-css').remove()
}
