define(function (require) {
  const [$, $$] = require('/vools.js')
  const Profile = require('controller/editor/profile/profile.js')
  const Editor = require('controller/editor/editor.js')

  const input = $$('[name="link_symbol"]', Profile.container)

  Editor.addProperty('link_symbol', () => {
    const value  = input.value
    return value.length ? value : null
  })
  Editor.addApplyQuery('link_symbol', link_symbol => {
    if (typeof(link_symbol) !== 'string') {
      input.value = ''
    } else {
      input.value = link_symbol
    }
  })

  return {}
})
