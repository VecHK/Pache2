(function (window, document, $, editor, CORE) {
  const button = $$('[p-action="preview"]', editor.contain);

  const checkCreated = () => {
    $(button).css({
      display: CORE.current ? '' : 'none'
    })
  };
  editor.on(['editor-show', 'editor-hide'], checkCreated)
  CORE.on('article-created', checkCreated)

  button.addEventListener('click', e => {
    if (CORE.current.is_draft) {
      button.href = `preview/${CORE.current._id}`
    } else {
      button.href = `/article/${CORE.current._id}`
    }
  })

})(window, window.document, vools, editor, CORE)
