define(function (require) {
  const [$, $$] = require('/vools.js')
  const PanelButton = require('src/panel-button.js')
  const TopPanel = PanelButton.create('p-command', $$('.panel'))

  TopPanel.wattingSetStyle = setStyle('style/pam-panel.css')

  return TopPanel
})
