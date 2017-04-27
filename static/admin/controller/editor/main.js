define(function (require) {
  const List = require('controller/list/list.js')
  const PageCode = require('controller/list/pagecode.js')
  const Editor = require('controller/editor/editor.js')
  const Tags = require('controller/editor/tags.js')
  const Profile = require('controller/editor/profile/main.js')
  const Category = require('controller/editor/category.js')
  const repost = require('controller/editor/repost.js')
  const preview = require('controller/editor/preview.js')

  const Article = require('model/article.js')
  Editor.on('submited', async function (result) {
    List.render(await Article.list(PageCode.page))
  })
})
