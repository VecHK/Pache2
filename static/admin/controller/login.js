define(function (require) {
  const EventModel = require('/pam-event.js')
  const Login = Object.create(EventModel)
  let [$, $$] = require('/vools.js')
  let auth = require('src/auth.js')

  let container = $.create('div').class('login', 'pam-auth').pop()
  $(container).html(`
    <div class="message">Authentication</div>
    <div class="description">　</div>

    <form class="auth-form">
      <input name="pass" placeholder="***" type="password" />
    </form>
  `)

  async function hide() {
    container.classList.add('auth-logined');
    await wait(0.618)
    container.style.display = 'none';
    Login.emit('hide')
  }
  async function show() {
    container.style.display = '';
    await wait(.020)
    container.classList.remove('auth-logined');
    Login.emit('show')
  }
  async function checkStatus() {
    await setStyle('style/pam-auth.css')
    $(document.body).append(container)
    await wait(.5)
    if (await auth.getStatus()) {
      hide()
    } else {
      $$('.auth-form [name="pass"]', container).placeholder = '請輸入密碼'
    }
  }
  checkStatus()

  async function auth_pass(e) {
    e.preventDefault()
    let result = await auth.login(this.pass.value)

    if (result) {
      $('.description', container).text('　')
      await hide()
    } else {
      $('.description', container).text('密碼錯誤')
      this.pass.value = ''
    }
  }
  $$('.auth-form', container).addEventListener('submit', auth_pass)

  Login.waitingLogin = async function() {
    show()
    const obj = {}
    const ok = () => {
      obj.resolve()
      Login.remove(ok)
    }
    return new Promise((resolve) => {
      obj.resolve = resolve
      Login.on('hide', ok)
    })
  }

  return Login
})
