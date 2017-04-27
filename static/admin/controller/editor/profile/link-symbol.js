define(function (require) {
  const [$, $$] = require('/vools.js')
  const Profile = require('controller/editor/profile/profile.js')
  const Editor = require('controller/editor/editor.js')

  const input = $$('[name="link_symbol"]', Profile.container)

  Editor.addProperty('link_symbol', () => input.value)
  Editor.addApplyQuery('link_symbol', link_symbol => {
    if (link_symbol === null) {
      input.value = ''
    } else {
      input.value = link_symbol
    }
  })

  return {}
})
