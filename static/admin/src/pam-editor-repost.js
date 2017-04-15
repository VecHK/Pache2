(function (window, document, editor) {
  const repost_frame = $$('[p-action="repost"]', editor.contain)
  const repost_checkbox = $$('[type="checkbox"]', repost_frame)

  CORE.setStyle('style/pam-editor-repost.css')

  editor.applyArticleProperty.push(function (article) {
    repost_checkbox.checked = article.is_repost
  })

  editor.extendsArticleProperty.is_repost = function (article) {
    return repost_checkbox.checked
  }

})(window, window.document, editor)
