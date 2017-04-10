define(function (require) {
  const TopButton = require('controller/top-panel.js')
  const errp = require('controller/error-panel.js')
  const Auth = require('src/auth.js')
  const Login = require('controller/login.js')
  const Logout = {}

  TopButton.click('logout', async function () {
    const logout_result = await Auth.logout()
    if (!logout_result) {
      throw errp.show(new Error('登出失敗'))
    }

    await Login.waitingLogin()
  })

  return {}
})
