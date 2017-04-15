define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')
  const prototype = Object.create(EventModel)
  Object.assign(prototype, {
    getElement(attr_value) {
      return $$(`[${this._attrName}="${attr_value}"]`, this.container)
    },
    click(attr_value, cb) {
      this.on(`${this._attrName}-${attr_value}`, () => cb(this._status))
    },
  })
  const PanelButton = {
    prototype,

    bind(container, instance, attr_name) {
      instance.container = container
      instance._attrName = attr_name
      const childs = Array.from(container.childNodes).filter(n => n.nodeType === 1)
      childs.forEach(ele => {
        let attr_value = ele.getAttribute(attr_name)
        if (!attr_value) {
          return;
        }
        instance._status = {}
        ele.addEventListener('click', e => {
          instance.emit(`${attr_name}-${attr_value}`, instance._status)
        })
      })
    },

    create(attr_name, container) {
      const instance = Object.create(this.prototype)
      this.bind(container, instance, attr_name)
      return instance
    },
  }

  return PanelButton
})
