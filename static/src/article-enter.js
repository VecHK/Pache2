(function () {
  var polyfill_arr = []

  // 首先需要 Promise 庫，採用 bluebird
  try {
    eval('new Promise(function (res) {res()})')
  } catch (e) {
    console.warn('unsupport Promise')
    polyfill_arr.push('/bluebird/bluebird.min.js')
  }

  // 如果不支持 async/await 則準備 regenerator
  try {
    eval('(async function () {})')
  } catch(err) {
    console.warn('unsupport async/await')
    polyfill_arr.push('/regenerator-runtime/runtime.js')
  }

  // 全都支持的話，直接加載
  // 支持 async/await 的主流瀏覽器都支持用得到的 ES 新特性，故不必顧慮運行問題
  if (!polyfill_arr.length) {
    require(['/front-article-concat/all.js'], function () {
      main()
    })
  } else {
    require(polyfill_arr, function (PromiseLib, regeneratorRuntimeLib) {
      if (arguments.length === 2) {
        // Promise, async/await 都不支持
        window.Promise = arguments[0]
        // window.regeneratorRuntime = arguments[1]
      } else if (arguments.length === 1) {
        // 這種應該只有是 Async/Await 不支持了，因為主流環境中不存在【僅支持 Await/Await，但不支持 Promise】的情況
        console.warn(polyfill_arr, PromiseLib)
        // window.regeneratorRuntime = arguments[0]
      }

      window.Promise = Promise
      require(['/front-article-concat-polyfill/all.js'], function () {
        main()
      })
    })
  }
})()
