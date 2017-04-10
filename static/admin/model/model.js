define(function (require) {
  const Model = {
    inherited() {},
    created() {},

    prototype: {
      init() {},
    },

    // 創建一個「子類」
    create() {
      const obj = Object.create(this)

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
      const instance = Object.create(this.prototype)
      // instance.parent = this

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
  };


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
