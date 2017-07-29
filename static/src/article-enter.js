function appendScript(src, cb) {
  var script = document.createElement('script')
  script.onload = cb
  script.src = src
  document.body.appendChild(script)
}
(function () {
  var polyfill_arr = []

  // 首先需要 Promise 庫，採用 bluebird
  var support_promise = true
  try {
    eval('new Promise(function (res) {res()})')
  } catch (e) {
    console.warn('unsupport Promise')
    support_promise = false
  }

  // 如果不支持 async/await 則準備 regenerator
  var support_async = true
  try {
    eval('(async a=>1)')
  } catch(err) {
    console.warn('unsupport [arrowFunction] or [async/await]')
    support_async = false
  }

  function done() { window.main() }
  if (support_promise && support_async) {
    appendScript('/front-article-concat/concat.js', done)
  } else if (support_promise) {
    appendScript('/front-article-concat/polyfill.js', done)
  } else {
    appendScript('/front-article-concat/promise-polyfill.js', done)
  }
})()
