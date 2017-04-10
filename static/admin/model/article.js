define(function (require) {
  const [$, $$] = require('/vools.js')
  const Model = require('model/model.js')
  const EventModel = require('/pam-event.js')
  const errp = require('controller/error-panel.js')
  const Article = Object.assign(Model.create(), EventModel)

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

  Article.extend({
    async remove(ids) {
      if (!Array.isArray(ids)) {
        throw new Error('Article.remove: ids 不是一個數組')
      }
      return await $.pjax(`${ROOT}/articles`, {
        method: 'DELETE',
        type: 'json',
        data: ids
      })
    },
    async patchFields(ids, fields) {
      if (!Array.isArray(ids)) {
        throw new Error('Article.patchFields: ids 不是一個數組')
      }
      return await $.pjax(`${ROOT}/articles`, {
        method: 'PATCH',
        type: 'json',
        data: {
          ids,
          fields,
        },
      }).then(JsonResult)
    },
    async get(id) {
      try {
        var result = await $.get(`${ROOT}/article/${id}`).then(JsonResult)
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
      const result = await $.get(`${ROOT}/articles/${page}`).then(JsonMiddle)

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
      return $.pjax(`${ROOT}/article/${this._id}`, {
        method: 'PATCH',
        type: 'json',
        data: this,
      }).then(JsonResult)
    },
    async save() {
      if (this._id) {
        return this.update()
      } else {
        let result = await $.pjax(`${ROOT}/article`, {
          method: 'POST',
          type: 'json',
          data: this,
        }).then(JsonResult)

        Object.assign(this, result)
        return this
      }
    },
    async remove() {
      if (!this._id) {
        throw new Error(`無 '_id' 的實例無法刪除`)
      }

      const result = await $.delete(`${ROOT}/article/${this._id}`).then(JsonResult)
      delete this._id

      return result
    },
  })

  console.warn(Article)
  window.Article = Article

  return Article
})
