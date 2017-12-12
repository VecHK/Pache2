
class SourceCodeCopyButton {
  async show() {
    await this.hidding

    if (this.status) { return }
    this.status = true

    const {copy_button} = this
    const {style} = copy_button

    style.display = ''
    return waitting().then(() => {
      copy_button.classList.add('is-show')
      style.opacity = 1
    })
  }

  hide() {
    if (!this.status) { return }
    this.status = false

    const {copy_button} = this
    const {style} = copy_button

    copy_button.classList.remove('positing')
    return waitting().then(() => {
      copy_button.classList.remove('is-show')
      style.opacity = 0
      return waitting()
    }).then(() => {
      this.hidding = transitionDurationWait(copy_button)
      return this.hidding
    }).then(() => {
      copy_button.style.display = 'none'
      return this.hidding
    })
  }

  'setLeft' () {
    const {copy_button} = this
    this.leftOffset = -(copy_button.offsetWidth / 2)
  }
  'clearLeft' () {
    this.leftOffset = 0
  }

  async 'positing' (top = this.last_top) {
    this.status || await this.show()
    this.last_top = top

    const {sourceCodeContainer, copy_button} = this
    let mouseButtonTop = getElementPageY(sourceCodeContainer) + top - copy_button.offsetHeight
    let mouseButtonLeft = getElementPageX(sourceCodeContainer) + (this.leftOffset || 0)// - (copy_button.offsetWidth * .182) // + sourceCodeContainer.offsetWidth

    let scrollingElement = getScrollingElement()
    if (scrollingElement.scrollTop > mouseButtonTop) {
      mouseButtonTop = mouseButtonTop + (scrollingElement.scrollTop - mouseButtonTop)
    }

    $(copy_button).css({
      top: `${mouseButtonTop + (copy_button.offsetHeight / 2)}px`,
      left: `${mouseButtonLeft - copy_button.offsetHeight / 2}px`,
    })

    await transitionDurationWait(copy_button)
    this.copy_button.classList.add('positing')
  }

  constructor() {
    this.initElement(...arguments)
  }

  'initElement' (sourceCodeContainer) {
    this.sourceCodeContainer = sourceCodeContainer

    const copy_button = $.create('div').class('mouse-copy')[0]
    $(copy_button).html(`<div class="copy-icon"><div class="back"></div><div class="front"></div></div>`)
    $(copy_button).css('display', 'none')

    copy_button.onclick = e => {
      this.emit('click', this)
    }

    $(document.body).append(copy_button)
    this.copy_button = copy_button
  }
}
EventLite.create(SourceCodeCopyButton.prototype)
