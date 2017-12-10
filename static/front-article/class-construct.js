const collectExtendsChain = (obj, arr = []) => {
  if (obj && (obj.__proto__ !== Object.prototype)) {
    arr.push(obj.__proto__)
    return collectExtendsChain(obj.__proto__, arr)
  } else {
    return arr
  }
}

function ClassConstruct() {
  class ConstructHook {
    'execConstruteHook' () {
      collectExtendsChain(this).reverse().forEach(ctx => {
        if (ctx.hasOwnProperty('construct')) {
          ctx['construct'].call(this, ctx)
        }
      })
    }

    constructor() {
      this.init && this.init.apply(this, arguments)
      this.execConstruteHook()

      this.emitHookHandle = (ev_name, ...args) => {
        collectExtendsChain(this).reverse().forEach(ctx => {
          if (ctx.hasOwnProperty(`-${ev_name}-`)) {
            ctx[`-${ev_name}-`].call(this, ...args)
          }
        })
      }
      this.emitHook(this.emitHookHandle)
    }
  }

  EventLite.create(ConstructHook.prototype)

  return ConstructHook
}
