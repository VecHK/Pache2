define(function (require) {
  const [$, $$] = require('/vools.js')
  const envir = require('src/envir.js')
  const Article = require('model/article.js')
  const TopButton = require('controller/top-panel.js')
  const Editor = require('controller/editor/editor.js')

  const new_post = {
    new() {
      const art = Article.init({
        title: '',
        content: '',
        contentType: 'markdown',
        tags: [],
        is_draft: false,
        is_repost: false,
      })
      Editor.apply(art)
      Editor.show()
    }
  }

  const button = TopButton.getElement('new')

  TopButton.click('new', new_post.new.bind(new_post))

  return new_post
})
