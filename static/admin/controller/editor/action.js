define(function (require) {
  const [$, $$] = require('/vools.js')
  const PanelButton = require('src/panel-button.js')
  const EditorAction = PanelButton.create('p-action', $$('.editor-panel'))

  EditorAction.wattingSetStyle;// = setStyle('style/pam-panel.css')

  return EditorAction
})
