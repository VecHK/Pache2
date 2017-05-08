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
  get on() { return this.addListener },
  addListener(name, fn) { this._checkEv(name).push(fn) },
  emit() {
    const args = Array.prototype.slice.apply(arguments)
    const evs = this._checkEv(args.shift())
    evs.forEach(fn => fn.apply(this, args))
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
