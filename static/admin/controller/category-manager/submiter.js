define(function (require) {
  const [$, $$] = require('/vools.js')
  const CategoryModel = require('model/category.js')
  const Controller = require('controller/controller.js')
  const Inputer = require('controller/category-manager/inputer.js')

  const Submiter = Controller.create().include({
    viewer() {
      $(this.container).html('')
      this.inputer.viewer()

      const 上移按鈕 = document.createElement('div')
      $(上移按鈕).class('moveup').text('↑')
      $(this.container).append(上移按鈕)
      上移按鈕.onclick = async e => {
        const {records} = CategoryModel
        const cate = this.inputer.getModel()
        const cateIndex = records.indexOf(cate)

        // 找得到並且不在第一位，records 中的記錄都是以 sort 排序，
        // 所以只要交換上一個記錄的排序號就可以達到上升的目的
        if (cateIndex !== -1 && cateIndex > 0) {
          const recordsCate = records[cateIndex - 1]
          const tmpSort = cate.sort
          cate.sort = -1  // Pache 中的分類排序碼默認值不可能是 -1，在這兒是為了後續保存不會衝突
          await cate.save()
          cate.sort = recordsCate.sort  // 變回正常的

          recordsCate.sort = tmpSort
          await recordsCate.save()
          await cate.save()

          await CategoryModel.refresh()
          this.emit('moveup', cate)
        }
      }

      const del_button = document.createElement('div')
      $(del_button).class('delete').text('Ｘ')
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
