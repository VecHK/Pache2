define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')

  const Controller = {
    prototype: Object.assign(Object.create(EventModel), {
      // 渲染
      render(viewer = this.viewer) {
        if (typeof(viewer) === 'function') {
          viewer.apply(this)
        } else {
          $(this.container).html(viewer)
        }
      },
      init() {},
    }),

    /**
      構造一個子控制器
      @param ele 控制器的元素
      @param modelInstance 綁定的模型實例
      @return child 子控制器
    */
    init(ele, modelInstance) {
      const child = Object.create(this.prototype)
      Object.assign(child, {
        container: ele,
        model: modelInstance,
      })
      child.init()
      child.render()
      return child
    },
    include() {
      Object.assign(this.prototype, ...arguments)
      return this
    },

    /**
      創建一個子控制器構造器
      @param html 視圖，可以是函數，也可以是字符串
      @return child 子控制器構造器
    */
    create() {
      const child = Object.create(this)

      const prototype = Object.create(this.prototype)
      child.prototype = Object.assign(prototype, {})

      return child
    },
    extend() {
      Object.assign(this, ...arguments)
      return this
    },
  }

  return Controller
})
