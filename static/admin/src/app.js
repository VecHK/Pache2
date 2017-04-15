function loadModule(name) {
  return new Promise((resolve, reject) => {
    requirejs(name, resolve, reject)
  })
}
function setStyle(href){
  const styleEle = document.createElement('link');
  styleEle.rel = 'stylesheet';
  styleEle.href = href;
  return new Promise((resolve, reject) => {
    styleEle.onload = resolve
    styleEle.onerror = reject
    document.body.appendChild(styleEle);
  })
}
function wait(sec) {
  return new Promise(r => setTimeout(r, sec * 1000))
}

(async function () {
  var ErrPanel = await loadModule(['controller/error-panel.js'])

  try {
    var auth = await loadModule(['src/auth.js'])
    var login = await loadModule(['controller/login.js'])

    await login.waitingLogin()

    var main = await loadModule(['controller/main.js'])

  } catch (e) {
    console.warn('error:', e)
    ErrPanel.showError(e)
  }

})()
