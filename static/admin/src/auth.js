define(function (require) {
  let [$, $$] = require('/vools.js')
  const Model = require('model/model.js')
  const ROOT = '/api/auth'
  const Auth = Model.create({
    async getRandom() {
      return (await this.GET(`${ROOT}/random`)).result
    },
    async getStatus() {
      return (await this.GET(`${ROOT}/status`)).result
    },
    async logout() {
      return (await this.GET(`${ROOT}/logout`)).result
    },
    async relogin() {
      return await this.login(this._lastPass)
    },
    async login(password) {
      this._lastPass = password
      const random = await this.getRandom()
      const auth_code = md5(random + password)
      let result = await this.POST(`${ROOT}/pass`, { pass: auth_code })
      return result.result
    },
  })

  return Auth
})
