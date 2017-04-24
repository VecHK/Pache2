define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')
  const Model = require('model/model.js')
  const errp = require('controller/error-panel.js')

  const ROOT = '/api'
  const Category = Model.create({
    records: [],
    async refresh() {
      const result = (await this.GET(`${ROOT}/categories`)).result

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

  const self = Category
  Category.include({
    async update() {
      const result = await self.ajax(`${ROOT}/category/${this._id}`, {
        method: 'PATCH',
        type: 'json',
        data: this,
      })
      return result.result
    },
    async save() {
      if (this._id) {
        return this.update(...arguments)
      }

      let result = await self.ajax(`${ROOT}/category`, {
        method: 'POST',
        type: 'json',
        data: this,
      })
      result = result.result

      Object.assign(this, result)
      return this
    },

    async remove() {
      if (!('_id' in this)) {
        throw new Error(`無 '_id' 的實例無法刪除`)
      }
      let result = await self.DELETE(`${ROOT}/category/${this._id}`)
      result = result.result
      delete this._id

      await self.refresh()

      return result
    },
  })

  return Category
})
