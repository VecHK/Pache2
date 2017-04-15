define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')
  const Model = require('model/model.js')
  const errp = require('controller/error-panel.js')
  const Category = Model.create()

  const ROOT = '/api'
  const JsonMiddle = res => {
    const json = JSON.parse(res)
    if (json.code > 0) {
      console.warn(json)
      const err = new PamError(`JsonMiddle 錯誤：`, json.msg)
      err.json = json
      errp.showError(err)
      throw err
    } else {
      return json
    }
  }
  const JsonResult = res => JsonMiddle(res).result

  Category.extend(EventModel)
  Category.extend({
    records: [],
    async refresh() {
      const result = await $.get(`${ROOT}/categories`).then(JsonResult)

      const {records} = this
      records.splice(0)
      result.forEach(n => records.push(this.init(n)))

      this.emit('records-refresh', records)

      return records
    },
    getById(id) {
      const {records} = this
      return records.find(record => record._id === id) || null
    },
    get(name) {
      const {records} = this
      return records.find(record => record.name === name) || null
    },
  })
  Category.include({
    update() {
      return $.pjax(`${ROOT}/category/${this._id}`, {
        method: 'PATCH',
        type: 'json',
        data: this,
      }).then(JsonResult)
    },
    async save() {
      if (this._id) {
        return this.update(...arguments)
      }

      let result = await $.pjax(`${ROOT}/category`, {
        method: 'POST',
        type: 'json',
        data: this,
      }).then(JsonResult)

      Object.assign(this, result)
      return this
    },

    async remove() {
      if (!('_id' in this)) {
        throw new Error(`無 '_id' 的實例無法刪除`)
      }
      const result = await $.delete(`${ROOT}/category/${this._id}`).then(JsonResult)
      delete this._id

      await Category.refresh()

      return result
    },
  })

  return Category
})
