define(function (require) {
  let [$, $$] = require('/vools.js')
  let errp = require('controller/error-panel.js')

  const ROOT = '/api/auth'
  const JsonMiddle = res => {
    const json = JSON.parse(res)
    if (json.code > 0) {
      console.warn(json)
      const err = new PamError(`JsonMiddle 錯誤：`, json.msg)
      err.json = json
      errp.showError(err)
      throw err
    } else {
      return json
    }
  }
  const JsonResult = res => JsonMiddle(res).result

  const Auth = {
    getRandom() {
      return $.get(`${ROOT}/random`).then(JsonResult)
    },
    getStatus() {
      return $.get(`${ROOT}/status`).then(JsonResult)
    },
    logout() {
      return $.get(`${ROOT}/logout`).then(JsonResult)
    },
    async login(password) {
      const random = await this.getRandom()
      const auth_code = md5(random + password)
      return $.post(`${ROOT}/pass`, { pass: auth_code }).then(JsonResult)
    },
  }

  return Auth
})
