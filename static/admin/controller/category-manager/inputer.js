define(function (require) {
  const [$, $$] = require('/vools.js')
  const Controller = require('controller/controller.js')

  const TypeInclude = {
    category: {
      _init() {},
      viewer() {
        const form = document.createElement('form')
        $(form).class('normal').html(`
          <input name="color" value="${this.model.color}" placeholder="color"/>
          <input name="name" value="${this.model.name}" placeholder="name"/>
          <button style="display:none"></button>`
        )

        $(this.container).append(form)
        this.form = form
        this.attachFormEvent()
      },
      setModel() {
        const {model, form} = this
        model.name  = form.name.value
        model.color = form.color.value
      },
    },
  }
  const Inputer = Controller.create().include({
    attachFormEvent(form = this.form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        this.setModel()
        this.emit('submit', this.getModel())
      })
    },
    getModel() {
      return this.model
    },
    init() {
      let {model} = this
      this.type = model.type
      console.warn('type:', this.type)
      switch(this.type) {
        case 'links':
        case 'article':
        case 'category':
          Object.assign(this, TypeInclude[model.type])
          this._init()
        break;
        default:
          throw new Error('未知的分類類型')
      }
    },
  })

  return Inputer
})
