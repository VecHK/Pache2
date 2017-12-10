// 延遲執行函數
// wait_step(Number, Function)  暫停 Number 毫秒后執行 Function
// wait_step(Function)  立即執行 Function
// wait_step(Number)  暫停 Number 毫秒
const wait_step = (() => {
  const isNull = val => null === val
  const isFunc = val => typeof(val) === 'function'

  /** 處理隊列項
    @param Object {step}
    @param Function stepSetter
  */
  function steping({handle}, stepSetter) {
    const result = handle()
    const next = () => fetchStep(stepSetter)

    if (isFunc(result) && ('query' in result)) {
      result.once('done', next)
    } else {
      next()
    }
  }

  /** 遍歷隊列
    @param Function stepSetter
    @return stepSetter
  */
  function fetchStep(stepSetter) {
    const {query} = stepSetter

    if (query.length) {
      const step = query.shift()
      const {timeout} = step
      const s = () => steping(step, stepSetter)
      isNull(timeout) ? s() : setTimeout(s, timeout)
    } else {
      stepSetter.emit('done')
    }

    return stepSetter
  }

  const nullHandle = () => {}

  /** 添加到延遲隊列
    @param Array query
    @param Number|null timeout
    @param Function handle
  */
  function queryPush(query, timeout, handle = nullHandle) {
    if (isFunc(timeout)) {
      handle = timeout
      timeout = null //用於標識為立即執行
    }
    query.push({ timeout, handle })
  }

  /**
    @param Number timeout
    @param Function handle
    @return stepSetter
  */
  function stepSetterInit() {
    const query = []
    queryPush(query, ...arguments)

    const stepSetter = EventLite.assign(function () {
      queryPush(query, ...arguments)
      return stepSetter
    })
    stepSetter.query = query

    fetchStep(stepSetter)
    return stepSetter
  }

  return stepSetterInit
})();
