define(function (require) {
  const [$, $$] = require('/vools.js')
  const CategoryModel = require('model/category.js')
  const Controller = require('controller/controller.js')
  const Inputer = require('controller/category-manager/inputer.js')

  const Creator = Controller.create().include({
    viewer() {
      $(this.container).html(`
        <select>
          <option value="category">普通</option>
          <option value="article">文章</option>
          <option value="links">鏈接</option>
        </select>
      `)
      this.selectEle = $$('select', this.container)
      this.selectEle.onchange = e => this.refresh()

      this.inputer.render()

      const create_button = document.createElement('div')
      $(create_button).class('create').text('創建')

      create_button.onclick = e => this.inputer.getModel().save()

      $(this.container).append(create_button)
    },
    refresh(type = this.selectEle.value) {
      this.model = CategoryModel.init({ type, color: '', name: '', value: '' })
      this.init()
      this.viewer()
    },
    init() {
      if (!this.model) return this.refresh('category')

      let {container, model} = this
      this.inputer = Inputer.init(container, model)
      this.inputer.on('submit', async model => {
        await model.save()
        await CategoryModel.refresh()
        this.refresh()
      })
    },
  })

  return Creator
})
