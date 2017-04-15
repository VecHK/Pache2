define(function (require) {
  (async function () {
    require('controller/list/main.js')

    require('controller/category-manager.js')

    require('controller/editor/main.js')
  })()

  return {}
})
