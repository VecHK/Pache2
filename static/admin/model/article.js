define(function (require) {
  const [$, $$] = require('/vools.js')
  const Model = require('model/model.js')
  const errp = require('controller/error-panel.js')

  const ROOT = '/api'
  const Article = Model.create({
    async remove(ids) {
      if (!Array.isArray(ids)) {
        throw new Error('Article.remove: ids 不是一個數組')
      }
      return await this.ajax(`${ROOT}/articles`, {
        method: 'DELETE',
        type: 'json',
        data: ids
      })
    },
    async patchFields(ids, fields) {
      if (!Array.isArray(ids)) {
        throw new Error('Article.patchFields: ids 不是一個數組')
      }
      return await this.ajax(`${ROOT}/articles`, {
        method: 'PATCH',
        type: 'json',
        data: {
          ids,
          fields,
        },
      }).result
    },
    async get(id) {
      try {
        var result = await this.GET(`${ROOT}/article/${id}`).result
      } catch (e) {
        if (e.xhr.status == 404) {
          result = null
        } else {
          let err = new Error('Article.get: ' + e.message)
          err.source = e
          errp.showError(err)
        }
      }

      return result ? this.init(result) : null
    },
    async listRaw(page) {
      if (!(page > 0)) {
        throw new Error('Article.list: page 參數不是一個大於 0 的數字')
      }
      const result = await this.GET(`${ROOT}/articles/${page}`)

      if (this.count !== result.count) {
        this.count = result.count
        this.emit('count-change', this.count)
      }

      if (this.countPage !== result.countPage) {
        this.countPage = result.countPage
        this.emit('countPage-change', this.countPage)
      }

      return result.result
    },
    async list() {
      const raw_list = await this.listRaw(...arguments)
      return raw_list.map(art => this.init(art))
    },
  })

  Article.include({
    update() {
      return this.parent.ajax(`${ROOT}/article/${this._id}`, {
        method: 'PATCH',
        type: 'json',
        data: this,
      }).result
    },
    async save() {
      if (this._id) {
        return this.update()
      } else {
        let result = await this.parent.pjax(`${ROOT}/article`, {
          method: 'POST',
          type: 'json',
          data: this,
        }).result

        Object.assign(this, result)
        return this
      }
    },
    async remove() {
      if (!this._id) {
        throw new Error(`無 '_id' 的實例無法刪除`)
      }

      const result = await this.parent.DELETE(`${ROOT}/article/${this._id}`).result
      delete this._id

      return result
    },
  })

  return Article
})
