define(function (require) {
  const [$, $$] = require('/vools.js')
  const Editor = require('controller/editor/editor.js')

  const repost_frame = $$('[p-action="repost"]', Editor.container)
  const repost_checkbox = $$('[type="checkbox"]', repost_frame)

  setStyle('style/pam-editor-repost.css')

  Editor.addProperty('is_repost', function () {
    return repost_checkbox.checked
  })
  Editor.addApplyQuery('is_repost', function (is_repost) {
    repost_checkbox.checked = is_repost
  })
})
