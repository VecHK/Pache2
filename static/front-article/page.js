class PageInit extends ClassConstruct() {
  "initPage" () {
    if (Array.isArray(this.page_list)) {
      const {page_list} = this

      $('.page', this.container).forEach((ele, page_code) => {

        Han(ele).render()
        ele.__scrollHeight = ele.scrollHeight

        if (this.isCurrentPageElement(ele)) {
          this._page_code = page_code
        } else {
          $(ele).css('display', 'none')
        }
        this.page_list.push(ele)
      })
    } else {
      this.page_list = []
      return this.initPage(...arguments)
    }
  }

  'init' (ele) {
    this.initElement(ele)

    this.initPageAction()
  }
}

class PageUtils extends PageInit {
  isCurrentPageElement(ele) { return /current-page/.test(ele.className) }
  isFristPage() { return !Boolean(this.page_code) }
  isLastPage() { return (this.page_list.length - 1) === this.page_code }
  getPreviousPage() { return this.page_list[this.page_code - 1] }
  getNextPage() { return this.page_list[this.page_code + 1] }

  'getMinHeight' () {
    return parseFloat(this.container.style.minHeight)
  }

  'heightMoreThanMinHeight' (ele) {
    return ele.__scrollHeight > this.getMinHeight()
  }
  'heightMoreThanWindow' (ele) {
    return ele.__scrollHeight > window.innerHeight
  }

  'elementHeightMoreThanMinHeight' (ele) {
    return ele.scrollHeight > this.getMinHeight()
  }
  'elementHeightMoreThanWindow' (ele) {
    return ele.scrollHeight > window.innerHeight
  }
  'containerHeightMoreThanWindow' () {
    return this.elementHeightMoreThanWindow(this.container)
  }

  'scrollTopMoreThanContainer' () {
    return getScrollingElement().scrollTop >= getElementPageY(this.container)
  }
  'scrollBackContainerTop' () {
    scrollTo(document.body, getElementPageY(this.container))
  }
}
class PageAction extends PageUtils {
  get current() {
    return this.page_list[this.page_code]
  }
  initPageAction() {  }
  getPage(page_code) { return this.page_list[page_code] }

  getPageCode() {
    return this.page_code
  }

  get page_code() {
    return this._page_code
  }
  set page_code(val) {
    const last_page_code = this._page_code
    this._page_code = val
    this.emit('page-code-change', val, last_page_code)
    return this._page_code
  }
  setPageCode(page_code) {
    const tmp_page_code = this.page_code
    if (page_code > this.page_code) {
      this.page_code = page_code
      const status = this.nextEffect(this.getPage(page_code), this.getPage(tmp_page_code))
      this.emit('page-code-changed', this.page_code)
      return status
    } else if (page_code < this.page_code) {
      this.page_code = page_code
      const status = this.previousEffect(this.getPage(page_code), this.getPage(tmp_page_code))
      this.emit('page-code-changed', this.page_code)
      return status
    } else {
      console.warn('设置的是同一页')
    }
    return this.page_code
  }

  containerScaleBack(pageEle) {
    const {container} = this
    const $container = $(container)

    if (!this.elementHeightMoreThanWindow(pageEle)) {
      $container.css('transitionDuration', '0s')
      return wait_step(20, () => {
        $container.css('height', `${container.scrollHeight}px`)
      })(20, () => {
        $container.css('transitionDuration', '')
      })(20, () => {
        if (this.elementHeightMoreThanMinHeight(pageEle)) {
          $container.css('height', `${pageEle.scrollHeight}px`)
        } else {
          $container.css('height', container.style.minHeight)
        }
      })
    }
  }

  getWaitTime(ele) {
    return (parseFloat(getComputedStyle(ele).transitionDuration) * 1000) + 20
  }

  previousShort(previous = this.getPreviousPage(), current = this.current) {
    $(current).css({
      'z-index': 9,
      position: 'fixed',
      bottom: 0,
      transform: 'translateY(0em)',
      background: 'white',
    })

    $(previous).css({
      'z-index': 9,
      transform: 'translateY(-1em)',
      display: 'none',
    })

    wait_step(0, () => {
      $(previous).removeCss('display')
    })(64, () => {
      $(previous).css({
        transform: 'translateY(0em)',
        opacity: 1,
      })
      $(current).css({
        transform: 'translateY(1em)',
        opacity: 0,
      })
    })(this.getWaitTime(previous), () => {

      $(previous).removeCss('z-index', 'transform', 'opacity', 'background')

      $(current).css('display', 'none')
      $(current).removeCss('z-index', 'position', 'bottom', 'transform', 'background', 'opacity')
    })
  }

  previousEffect(previous = this.getPreviousPage(), current = this.current) {
    this.operating = true
    const status = EventLite.create({
      ctx: this,
      container: this.container,
      current,
      operate: previous,
      type: 'previous',
      effect_type: '',
    })

    const $previous = $(previous)
    const $current = $(current)

    const wait_time = parseFloat(getComputedStyle(previous).transitionDuration) * 1000
    wait_step(20, () => {
      status.emit('created', status)
    })(20, () => {
      $previous.css({ opacity: 0, background: 'white', position: 'absolute' })
    })(20, () => {
      $previous.removeCss('display')
    })(20, () => {
      status.emit('pre-transform', status)
    })(20, () => {
      status.emit('start-transform', status)

      let positionValue

      if (!this.elementHeightMoreThanMinHeight(current) && !this.elementHeightMoreThanMinHeight(previous)) {
        status.effect_type = '当前页和操作页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
      }
      else if (this.scrollTopMoreThanContainer() && !this.elementHeightMoreThanWindow(previous) && this.elementHeightMoreThanMinHeight(previous)) {
        status.effect_type = '滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        return this.previousShort(previous, current)
      }
      else if (this.scrollTopMoreThanContainer() && !this.elementHeightMoreThanWindow(previous) && !this.elementHeightMoreThanMinHeight(previous)) {
        status.effect_type = '滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        return this.previousShort(previous, current)
      }
      else if (!this.scrollTopMoreThanContainer() && !this.elementHeightMoreThanWindow(previous) && !this.elementHeightMoreThanMinHeight(previous)) {
        status.effect_type = '滚动高度不大于容器且操作页高度不大于视口高度且操作页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
      }
      else if (this.elementHeightMoreThanMinHeight(previous) && !this.elementHeightMoreThanMinHeight(current)) {
        current.style.height = this.container.style.minHeight
        $(this.container).css('height', '150vh')
        status.effect_type = '操作页高度大于容器最小高度且当前页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
      }
      else if (this.scrollTopMoreThanContainer()) {
        status.effect_type = '滚动高度大于容器'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'fixed'
      } else {
        status.effect_type = '滚动高度不大于容器'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
        $(this.container).css('height', '150vh')
      }

      $current.css({
        transform: 'translateY(0em)',
        opacity: 1,
      })
      $previous.css({
        position: positionValue,
        top: 0,
      })

      if (!this.elementHeightMoreThanWindow(previous)) {
        return this.containerScaleBack(previous)
      } else {
        $previous.css('height', '150vh')
      }
    })(20, () => {
      status.emit('apply-effect')
      $current.css({
        transform: 'translateY(1em)',
        opacity: 0,
      })
      $previous.css({
        opacity: 1,
      })
    })(wait_time + 20, () => {
      if (this.scrollTopMoreThanContainer()) {
        this.scrollBackContainerTop()
      }
      status.emit('transform-done')
    })
    (20, () => {
      $([$previous[0], this.container]).css('transitionDuration', '0s')
      $previous.removeCss('height', 'opacity', 'background', 'position', 'top')
      $(this.container).removeCss('height')
    })(20, () => {
      $([$previous[0], this.container]).removeCss('transitionDuration')
      $current.css('display', 'none')
    })(20, () => {
      $current.removeCss('transform', 'height', 'opacity')
      this.operating = false
      status.emit('done')
    })(20, () => {
      status.emit('all-done')
    })

    return status
  }
  'previous' () {
    return this.setPageCode(this.page_code - 1)
  }

  'nextShort' (next = this.getNextPage(), current = this.current) {
    console.log('nextShort')
    $(current).css({
      zIndex: 9,
      position: 'fixed',
      background: 'white',
      bottom: '0',
      opacity: '1',
      transform: 'translateY(0em)',
    })
    $(next).css({
      display: 'none',
      opacity: '0',
      transform: 'translateY(1em)',
    })


    const wait_time = parseFloat(getComputedStyle(current).transitionDuration) * 1000
    wait_step(32, () => {
      $(next).removeCss('display')
    })(64, () => {
      $(current).css({
        opacity: '0',
        transform: 'translateY(-1em)',
      })

      $(next).css({
        opacity: '1',
        transform: 'translateY(0em)',
      })

    })(wait_time + 32, () => {

      $(current).css('display', 'none')
      $(current).removeCss('zIndex', 'position', 'bottom', 'opacity', 'transform', 'background')
      $(next).removeCss('opacity', 'transform')
      next.style.opacity = ''
    })
  }

  nextEffect(next = this.getNextPage(), current = this.current) {
    this.operating = true
    const status = EventLite.create({
      ctx: this,
      container: this.container,
      current,
      operate: next,
      type: 'next',
      effect_type: ''
    })

    const wait_time = parseFloat(getComputedStyle(current).transitionDuration) * 1000

    wait_step(20, () => {
      status.emit('created', status)
      next.style.top = '1em'
      next.style.opacity = '0'
    })(20, () => {
      next.style.display = ''
    })(20, () => {
      status.emit('pre-transform', status)
    })(20, () => {
      status.emit('start-transform', status)
      let positionValue
      if (!this.elementHeightMoreThanMinHeight(current) && !this.elementHeightMoreThanMinHeight(next)) {
        status.effect_type = '当前页和操作页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
      }
      else if (this.scrollTopMoreThanContainer() && !this.elementHeightMoreThanWindow(next) && this.elementHeightMoreThanMinHeight(next)) {
        status.effect_type = '滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        return this.nextShort(next, current, status)
      }
      else if (this.scrollTopMoreThanContainer() && !this.elementHeightMoreThanWindow(next) && !this.elementHeightMoreThanMinHeight(next)) {
        status.effect_type = '滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        return this.nextShort(next, current, status)
      }
      else if (!this.scrollTopMoreThanContainer() && !this.elementHeightMoreThanWindow(next) && !this.elementHeightMoreThanMinHeight(next)) {
        status.effect_type = '滚动高度不大于容器且操作页高度不大于视口高度且操作页高度不大于容器最小高度'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
      }
      else if (this.scrollTopMoreThanContainer()) {
        status.effect_type = '滚动高度大于容器'
        positionValue = 'fixed'
        status.emit('effect-type', status.effect_type, status)
      }
      else {
        status.effect_type = '滚动高度不大于容器'
        status.emit('effect-type', status.effect_type, status)
        positionValue = 'absolute'
        // $(this.container).css('height', '150vh')
        $(next).css('height', '150vh')
      }

      $(next).css({
        position: positionValue,
        background: 'white',
        'z-index': 9,
      })
    })(20, () => {
      $(next).css({
        top: '0em',
        opacity: '1',
      })
      $(current).css({
        opacity: '0'
      })

      if (!this.elementHeightMoreThanWindow(next)) {
        return this.containerScaleBack(next)
      }
    })(wait_time + 17, () => {
      console.log('transform-done')
      if (this.scrollTopMoreThanContainer()) {
        this.scrollBackContainerTop()
      }
      status.emit('transform-done')
    })(30, () => {
      $(next).removeCss('position', 'top', 'background')
      $(current).css('display', 'none')
    })(20, () => {
      $(this.container).removeCss('height')
      $(next).removeCss('height', 'z-index')

      $([next, this.container]).css('transitionDuration', '0s')

      status.emit('done')
      this.operating = false
    })(getTransitionDuration(this.container) + 20, () => {
      $([next, this.container]).removeCss('transitionDuration')
      status.emit('all-done')
    })

    return status
  }
  'next' () {
    return this.setPageCode(this.page_code + 1)
  }
}
class Page extends PageAction {
  'resizeHandle' () {
    const topBlock = $$('.top-block')
    const minHeight = window.innerHeight - topBlock.scrollHeight
    this.container.style.minHeight = `${minHeight}px`
    return minHeight
  }
  setContainerMinHeight() {
    window.addEventListener('resize', () => {
      this.resizeHandle()
    })
    return this.resizeHandle()
  }
  initElement(ele) {
    this.container = ele
    this.setContainerMinHeight()

    this.initPage()
  }
}

pa_init(async () => {
  const articleContainer = $$('#article')

  window.page = new Page(articleContainer)
  window.topMenu = new PageControl($$('.top-menu'), window.page)

  window.pageSelector = new PageSelector($$('.page-selector'), window.page)

  window.sourceCodeFrame = new SourceCodeFrame(articleContainer)
  window.metaImage = new MetaImageFrame(articleContainer)
})
