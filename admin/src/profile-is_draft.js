(function (window, document, editor, articleProfile, $) {
  const checkbox = $('[name="is_draft"]')[0]

  editor.applyArticleProperty.push(function (article) {
    checkbox.checked = article.is_draft || false
  })

  editor.extendsArticleProperty.is_draft = function (article) {
    return checkbox.checked
  }

})(window, window.document, editor, articleProfile, vools)
