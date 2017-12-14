define(function (require) {
  const [$, $$] = require('/vools.js')
  const Controller = require('controller/controller.js')

  const TypeInclude = {
    category: {
      _init() {},
      viewer() {
        const form = document.createElement('form')
        $(form).class('normal').html(`
          <input name="name" value="${this.model.name}" placeholder="name"/>
          <input name="color" value="${this.model.color}" placeholder="color"/>
          <button style="display:none"></button>
        `)

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
    links: {
      _init() {},
      viewer() {
        const form = document.createElement('form')
        $(form).class('links').html(`
          <input name="name" value="${this.model.name}" placeholder="name" />
          <input name="value" value="${this.model.value}" placeholder="value" />
          <button style="display:none"></button>
        `)
        $(this.container).append(form)
        this.form = form
        this.attachFormEvent()
      },
      setModel() {
        const {model, form} = this
        model.color = '#000'  // 單一顏色
        model.name = form.name.value
        model.value = form.value.value
      },
    },
    article: {
      _init() {},
      viewer() {
        const form = document.createElement('form')
        $(form).class('articles').html(`
          <input name="name" value="${this.model.name}" placeholder="name" />
          <input name="value" value="${this.model.value}" placeholder="文章 id" />
          <button style="display:none"></button>
        `)
        $(this.container).append(form)
        this.form = form
        this.attachFormEvent()
      },
      setModel() {
        const {model, form} = this
        model.color = '#000'  // 單一顏色
        model.name = form.name.value
        model.value = form.value.value
      },
    }
  }
  const Inputer = Controller.create().include({
    attachFormEvent(form = this.form) {
      $('input', form).forEach(input => {
        input.onblur = e => {
          e.stopPropagation()
          e.stopImmediatePropagation()
          this.setModel()
          this.emit('blur', this.getModel())
        }
      })
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
