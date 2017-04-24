define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')

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

  const Model = Object.assign(Object.create(EventModel), {
    inherited() {},
    created() {},

    wattingLogin() {
      console.warn('401')
    },

    prototype: {
      init() {},
    },

    async ajax(url, opt) {
      try {
        var result = await $.pjax(url, opt)
      } catch (err) {
        if (err.status === 401) {
          await Model.waitingLogin()
          return this.ajax(...arguments)
        }
        throw err
      }

      return JsonMiddle(result)
    },

    GETresult(...args) {
      return this.GET(...args).then(obj => obj.result)
    },
    GET(url) {
      return this.ajax(url, {
        method: 'GET'
      })
    },
    DELETE(url) {
      return this.ajax(url, {
        method: 'DELETE'
      })
    },
    POST(url, data) {
      return this.ajax(url, {
        method: 'POST',
        data
      })
    },

    // 創建一個「子類」
    create(ext) {
      const obj = Object.create(this)
      Object.assign(obj, ext)

      // 原型鏈
      obj.prototype = obj.fn = Object.create(this.prototype)

      /* 被繼承時執行 inherited */
      this.inherited()

      /* 對象創建時執行 created */
      obj.created()

      return obj
    },

    // 返回一個實例
    init() {
      const parentObj = Object.assign(Object.create(this.prototype), {
        parent: this,
      })
      const instance = Object.create(parentObj)
      // 實例所繼承的 init 方法為構造函數
      instance.init.apply(instance, arguments)

      return instance
    },

    // 添加靜態屬性
    // extended 的意思是執行完成后的回調事件，參數是當前上下文環境
    extend(obj) {
      const extended = obj.extended
      Object.assign(this, obj)
      if (extended) extended(this)
    },

    // 在原型中添加屬性
    // included 的意思是執行完成后的回調事件，參數是當前上下文環境
    include(obj) {
      const included = obj.included
      Object.assign(this.prototype, obj)
      if (included) included(this)
    },
  });


  Model.include({
    init(atts) {
      if (atts) this.load(atts)
    },
    load(attributes) {
      Object.assign(this, attributes)
    },
  })

  return Model
})
