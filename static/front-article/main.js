var EventLite = {
  _checkEv(name) {
    if (!this._evPool) {
      this._evPool = {}
    }
    if (!Array.isArray(this._evPool[name])) {
      this._evPool[name] = []
    }
    return this._evPool[name]
  },
  fetchAfter: [],
  once(names, fn) {
    if (!Array.isArray(names)) {
      names = [names]
    }
    names.forEach(ev_name => {
      const that = this
      const h_fn = function () {
        this.fetchAfter.push(() => that.remove(names, h_fn))
        return fn.apply(that, arguments)
      }
      this.on(ev_name, h_fn)
    })
  },
  get on() { return this.addListener },
  addListener(names, fn) {
    if (Array.isArray(names)) {
      names.forEach(name => this.addOneListener(name, fn))
      return this
    } else {
      return this.addListener([names], fn)
    }
  },
  addOneListener(name, fn) { this._checkEv(name).push(fn) },
  emit() {
    const args = Array.prototype.slice.apply(arguments)
    const evs = this._checkEv(args.shift())
    evs.forEach(fn => fn.apply(this, args))
    this.fetchAfter.forEach(fn => fn())
    this.fetchAfter.splice(0, this.fetchAfter.length)
  },
  remove(names, fn) {
    if (Array.isArray(names)) {
      names.forEach(name => {
        const ev_list = this._checkEv(name)
        const index = this._checkEv(name).indexOf(fn)
        if (index !== -1) {
          ev_list.splice(index, 1)
        }
      })
    } else {
      return this.remove([names], fn)
    }
  },
  create(obj) {
    obj.__proto__ = this
    return obj
  }
}

function ObjectAssign(source, ...objs) {
  objs.forEach(obj => {
    for(let key in obj) {
      if (obj.hasOwnProperty(key)) source[key] = obj[key]
    }
  })
  return source
}

function waitting(ms) {
  return new Promise(res => setTimeout(res, ms))
}

function pa_init(fn) {
  if (!window.fn_arr) window.fn_arr = []
  fn_arr.push(fn)
}
/* 入口 */
window.main = async function () {
  for (let cursor = 0; cursor < fn_arr.length; ++cursor) {
    await fn_arr[cursor]()
  }

  // 防止露陷的 CSS 要刪除掉了
  $('.execable-css').remove()
}
