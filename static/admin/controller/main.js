define(function (require) {
  (async function () {
    require('controller/list/main.js')

    require('controller/category-manager/main.js')

    require('controller/editor/main.js')
  })()

  return {}
})
