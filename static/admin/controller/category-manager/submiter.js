define(function (require) {
  const [$, $$] = require('/vools.js')
  const Controller = require('controller/controller.js')
  const Inputer = require('controller/category-manager/inputer.js')

  const Submiter = Controller.create().include({
    viewer() {
      $(this.container).html('')
      this.inputer.viewer()

      const del_button = document.createElement('div')
      $(del_button).class('delete').text('刪除')

      del_button.onclick = async e => {
        await this.inputer.getModel().remove()
        this.onRemove()
      }

      $(this.container).append(del_button)
    },
    onRemove() {
      this.emit('remove')
    },
    init() {
      let {container, model} = this
      this.inputer = Inputer.init(container, model)
      this.inputer.on('submit', async model => {
        await model.save()

      })
    },
  })

  return Submiter
})
