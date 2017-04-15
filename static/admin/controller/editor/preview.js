define(function (require) {
  const [$, $$] = require('/vools.js')
  const Editor = require('controller/editor/editor.js')

  const button = $$('[p-action="preview"]', Editor.container)

  const checkCreated = () => {
    $(button).css({
      display: Editor.article._id ? '' : 'none'
    })
  }
  Editor.on('editor-show', checkCreated)
  Editor.on('editor-hide', checkCreated)

  Editor.on('submited', checkCreated)

  button.addEventListener('click', e => {
    if (Editor.article.is_draft) {
      button.href = `preview/${Editor.article._id}`
    } else {
      button.href = `/article/${Editor.article._id}`
    }
  })
})
