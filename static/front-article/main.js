function waitting(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function pa_init(fn) {
  if (!window.fn_arr) window.fn_arr = []
  fn_arr.push(fn)
}
/* 入口 */
window.main = async function () {
  for (let cursor = 0; cursor < fn_arr.length; ++cursor) {
    await fn_arr[cursor]()
  }
}
