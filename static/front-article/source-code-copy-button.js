
class SourceCodeCopyButton {
  async show() {
    await this.hidding

    if (this.status) { return }
    this.status = true

    const {copy_button} = this
    const {style} = copy_button

    style.display = ''

    return waitting().then(() => {
      style.opacity = 1;
      if ('filter' in style) {
        style.filter = 'blur(0px)'
      } else if ('webkitFilter' in style) {
        style.webkitFilter = 'blur(0px)'
      } else if ('mozFilter' in style) {
        style.mozFilter = 'blur(0px)'
      }
    })
  }

  hide() {
    if (!this.status) { return }
    this.status = false

    const {copy_button} = this
    const {style} = copy_button
    style.opacity = ''
    style.transition = ''

    if (style.filter) {
      style.filter = ''
    } else if (style.webkitFilter) {
      style.webkitFilter = ''
    } else if (style.mozFilter) {
      style.mozFilter = ''
    }
    console.log(getComputedStyle(copy_button).transitionDuration)
    const total_time = getComputedStyle(copy_button).transitionDuration.split(',').map(dur => {
      const dur_ms = parseFloat(dur.trim()) * 1000
      return waitting(dur_ms)
    })
    this.hidding = Promise.all(total_time).then(() => {
      copy_button.style.display = 'none'
    })

    return this.hidding
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

    let total_time = getComputedStyle(copy_button).transitionDuration.split(',')
    total_time.map(dur => {
      const dur_ms = parseFloat(dur.trim()) * 1000
      return waitting(dur_ms)
    })
    await Promise.all(total_time)
    this.copy_button.style.transition = '-webkit-filter 500ms, opacity 382ms, top 382ms, left 182ms'
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
