define(function (require) {
  const [$, $$] = require('/vools.js')

  setStyle('style/error-panel.css')
  var container = $.create('div').class('error-panel').css('display', 'none').pop()
  $(container).html(`
    <h1>PAM 錯誤</h1>
    <div class="message">（錯誤消息）</div>
    <pre><div class="stack">（錯誤棧）</div></pre>
  `)
  $(document.body).append(container)


  const ErrPanel = {
    showError(err) {
      $('.message', container).text(err.message)
      $('.stack', container).text(err.stack)
      $(container).fadeIn()
      return err
    },
    async exec(fn) {
      try {
        return await fn
      } catch (e) {

      }
    },
  }

  return ErrPanel
})
