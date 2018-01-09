
const AsyncCall = (() => {
  function AsyncCall () {  }
  const AsyncCallPrototype = {
    _getAsyncQuery (name) {
      const {_async_call_pool} = this

      if (Array.isArray(_async_call_pool[name])) {
        return _async_call_pool[name]
      } else {
        return (_async_call_pool[name] = [])
      }
    },

    async emit (name, ...args) {
      const query = this._getAsyncQuery(name)

      for (let i = 0; i < query.length; ++i) {
        await query[i](...args)
      }
    },
    on (name, handle) {
      const query = this._getAsyncQuery(name)
      query.push(handle)
    },
  }

  AsyncCall.mixin = target => ObjectAssign(target, AsyncCallPrototype, {
    _async_call_pool: Object(),
  })

  ObjectAssign(AsyncCall.prototype, AsyncCallPrototype)

  return AsyncCall
})();
