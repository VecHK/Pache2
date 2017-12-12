function getTransitionDuration (ele) {
  return getComputedStyle(ele)['transition-duration'].split(',').map(time =>
    parseFloat(time) * 1000
  ).sort((a, b) => a > b).pop()
}
function transitionDurationWait (ele) {
  return Promise.all(
    getComputedStyle(ele)['transition-duration'].split(',').map(time =>
      waitting( time * 1000 )
    )
  )
}

const PageSelectorClass = () => {
  class Constructor extends ClassConstruct() {
    init(container, page) {
      this.container = container
      this.$page = page
    }
  }

  class PageElement extends Constructor {
    get $$() { return sel => $$(sel, this.container) }
    get $() { return sel => $(sel, this.container) }
  }

  class PageControlInit extends PageElement {
    '-open-' () {
      this.$pageControl.disable_page_code_change = true
      this.$pageControl.hideNext()
      this.$pageControl.hidePrevious()
    }
    '-closed-' () {
      this.$pageControl.disable_page_code_change = false
      this.$pageControl.changeHandle()
    }
    'construct' () {
      this.$pageControl = new PageControl($$('.page-selector-frame', this.container), this.$page)
    }
  }

  class PageControlPrevious extends PageControlInit {
    'b-previous-滚动高度大于容器' (type, status) {
      this.slideHide(type, status)
    }
    'b-previous-滚动高度不大于容器' (type, status) {
      this.hide(type, status)
    }
    'b-previous-当前页和操作页高度不大于容器最小高度' (type, status) {
      this.fxied(type, status)
    }
    'b-previous-操作页高度大于容器最小高度且当前页高度不大于容器最小高度' (type, status) {
      this.hide(type, status)
    }
    'b-previous-滚动高度不大于容器且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this.fxied(type, status)
    }
    'b-previous-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度大于容器最小高度' (type, status) {
      this.adaptSlide(type, status)
    }
    'b-previous-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this.fxied(type, status)
    }
  }
  class PageControlNext extends PageControlPrevious {
    'b-next-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度大于容器最小高度' (type, status) {
      this.adaptSlide(type, status)
    }
    'b-next-滚动高度不大于容器' (type, status) {
      this.hide(type, status)
    }
    'b-next-滚动高度大于容器' (type, status) {
      this.hide(type, status)
    }
    'b-next-当前页和操作页高度不大于容器最小高度' (type, status) {
      this.fxied(type, status)
    }
    'b-next-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this.fxied(type, status)
    }

  }
  class PageControlAction extends PageControlNext {
    'hide' (type, status) {
      this.$(this.container).css({
        position: 'fixed',
        transition: 'opacity 618ms',
        opacity: 0,
      })
      status.on('done', () => {
        this.$(this.container).removeCss('transition', 'opacity')
      })
    }
    'applyPageCode' () {
      this.page_code = this.$page.page_code
      this.$pageControl.disable_page_code_change = true
      this.$pageControl.changeHandle()
    }
    'fxied' (type, status) {
      $(this.container).css('position', 'fixed')
      this.applyPageCode()
      status.on('done', () => {
        $(this.container).removeCss('position')
      })
    }
    'adaptSlide' (type, status) {
      const minHeight = parseFloat(status.container.style.minHeight)
      const diff = parseFloat(status.operate.__scrollHeight) - minHeight

      this.$(this.container).css('transform', `translateY(${diff}px)`)
      this.$('.page-selector-frame').removeCss('height')
      status.on('done', () => {
        this.$(this.container).removeCss('transform', 'position')
      })
    }
    'slideHide' (type, status) {
      this.$(this.container).css('transform', `translateY(${4}em)`)
      this.$('.page-selector-frame').removeCss('height')
      status.on('done', () => {
        this.$(this.container).removeCss('transform', 'position')
      })
    }

    'construct' () {
      const {$pageControl, $page} = this

      const pageControlBus = $pageControl.SELF.bus

      pageControlBus.on('click', (clickType, status) => {

        status.on('created', status => {
          const {is_safari} = $.browser
          console.warn('is_safari:', is_safari)

          const {ctx, operate, current} = status

          if (!ctx.heightMoreThanMinHeight(current) && !ctx.heightMoreThanMinHeight(operate)) {
            $(this.container).css('position', 'fixed')
            return this.applyPageCode()
          }

          if (ctx.scrollTopMoreThanContainer()) {
            $(this.container).css({ position: 'fixed' })
            status.on('effect-type', (type, status) => {
              console.log('effect-type:', type)
              const prop = `b-${status.type}-${type}`
              this[prop] && this[prop](type, status)
            })
            return
          }
          if (status.type === 'next') {
            if (ctx.heightMoreThanWindow(current)) {
              if (ctx.heightMoreThanWindow(operate)) { // 大 => 大
                $(this.container).css({ display: 'none' })
                status.on('all-done', () => {
                  $(this.container).removeCss('display')
                })
              } else if (ctx.heightMoreThanMinHeight(operate)) { // 大 => 中
                $(this.container).css({ display: 'none' })
                status.on('all-done', () => {
                  $(this.container).removeCss('display')
                })
              } else if (!ctx.heightMoreThanMinHeight(operate)) { // 大 => 小
                console.log('大 => 小')
                this.$(this.container).css({
                  position: 'fixed',
                  transform: `translateY(4em)`,
                  transitionDuration: `0s`,
                })
                status.on('start-transform', () => {
                  this.applyPageCode()
                  this.$(this.container).css({
                    transitionDuration: ``,
                    transform: 'translateY(0em)',
                  })
                })
                status.on('done', () => {
                  this.$(this.container).removeCss('position', 'transform', 'translateDuration')
                })
              }
            } else if (ctx.heightMoreThanMinHeight(current)) {
              if (ctx.heightMoreThanWindow(operate)) { // 中 => 大
                if (getScrollingElement().scrollTop > 0) {
                  $(this.container).css({ position: 'fixed' })
                  this.slideHide('', status)
                  status.on('done', () => $(this.container).removeCss('position'))
                } else {
                  $(this.container).css({ display: 'none' })
                  status.on('all-done', () => {
                    $(this.container).removeCss('display')
                  })
                }
              } else if (ctx.heightMoreThanMinHeight(operate)) { // 中 => 中
              } else if (!ctx.heightMoreThanMinHeight(operate)) { // 中 => 小
                if (getScrollingElement().scrollTop > 0) {
                  this.fxied('', status)
                }
              }
            } else if (!ctx.heightMoreThanMinHeight(current)) {
              $(this.container).css({ position: 'fixed' })
              if (ctx.heightMoreThanWindow(operate)) { // 大 => 小
                this.slideHide('', status)
              } else if (ctx.heightMoreThanMinHeight(operate)) { // 小 => 中

                this.adaptSlide('', status)
              }/* else if (!ctx.heightMoreThanMinHeight(operate)) { // 小 => 小
              }*/
              status.on('done', () => $(this.container).removeCss('position', 'bottom', 'top'))
            } else {
              console.warn('???')
            }
          }
          else if (status.type === 'previous') {
            if (ctx.heightMoreThanWindow(current)) {
              if (ctx.heightMoreThanWindow(operate)) { // 大 => 大
                $(this.container).css({ display: 'none' })
                status.on('all-done', () => {
                  $(this.container).removeCss('display')
                })
              } else if (ctx.heightMoreThanMinHeight(operate)) { // 大 => 中
                $(this.container).css({ display: 'none' })
                status.on('all-done', () => {
                  $(this.container).removeCss('display')
                })
              } else if (!ctx.heightMoreThanMinHeight(operate)) { // 大 => 小
                $(this.container).css({
                  'display': 'none',
                  'position': 'fixed',
                  'transform': 'translateY(4em)',
                })
                status.on('pre-transform', () => {
                  $(this.container).removeCss('display')
                })
                status.on('start-transform', () => {
                  this.applyPageCode()
                  $(this.container).css('transform', 'translateY(0em)')
                })
                status.on('transform-done', () => {
                  $(this.container).removeCss('transform')
                })
              }
            } else if (ctx.heightMoreThanMinHeight(current)) {
              if (ctx.heightMoreThanWindow(operate)) { // 中 => 大
                if (getScrollingElement().scrollTop > 0) {
                  $(this.container).css({ position: 'fixed' })
                  this.slideHide('', status)
                  status.on('done', () => $(this.container).removeCss('position'))
                } else {
                  $(this.container).css({ display: 'none' })
                  status.on('all-done', () => {
                    $(this.container).removeCss('display')
                  })
                }
              } else if (ctx.heightMoreThanMinHeight(operate)) { // 中 => 中
              } else if (!ctx.heightMoreThanMinHeight(operate)) { // 中 => 小
                this.applyPageCode()
                status.on('transform-done', () => {
                  $(this.container).css({ position: 'fixed' })
                })
                status.on('done', () => $(this.container).removeCss('position'))
              }
            } else if (!ctx.heightMoreThanMinHeight(current)) {
              $(this.container).css({ position: 'fixed' })
              if (ctx.heightMoreThanMinHeight(operate)) { // 小 => 大 和 小 => 中
                status.on('apply-effect', () => {
                  this.$(this.container).css('transform', `translateY(4em)`)
                })
                status.on('done', () => {
                  this.$(this.container).removeCss('transform', 'position')
                })
              }
              status.on('done', () => $(this.container).removeCss('position'))
            } else {
              console.warn('???')
            }
          }

        })

        status.on('done', type => {
          this.$(this.container).removeCss('position')
          this.page_code = $page.page_code
          $pageControl.disable_page_code_change = true
          $pageControl.changeHandle()

          this.emit('closed')
        })
      })
    }
  }

  class Triangle extends PageControlAction {
    get triangleEle () { return this.$('.selector-triangle') }
    '-close-' () {
      this.triangleEle.removeCss('transform')
    }
    '-open-' () {
      this.triangleEle.css({transform: `translateY(5em)`})
    }
  }

  class PageCode extends Triangle {
    get page_code() {
      if (!this.hasOwnProperty('_page_code')) {
        this._page_code = 0
      }
      return this._page_code
    }

    set page_code (value) {
      console.log('set current page code:', value)
      if (parseInt(value) !== value) {
        console.warn('this:', this)
        console.warn('value:', value)
        throw new Error('設定的 currentPageCode 不是一個整數')
      } else if (value < 0) {
        return console.warn(`設定的 currentPageCode(${value}) 不能小於 0`)
      } else if (value >= (this.$page.page_list.length)) {
        return console.warn(`設定的 currentPageCode(${value}) 大於等於最大頁碼限制(${this.$page.page_list.length})`)
      } else {
        this._page_code = value
        this.positingPageCode()
        this.emit('pagecode-change', this._page_code)
      }
    }

    'positingPageCode' (page_code = this.page_code) {
      const list = this.$('.page-selector-list')
      const pageItem = this.$$('.page-selector-item')

      const triangleHeight = $$('.selector-triangle').offsetHeight
      const itemHeight = parseFloat(getComputedStyle(pageItem).height)

      if (this.status) {
        // pageItem 的 padding 值，以及 pageItem 的線寬
        var base_offset = `translateY(${itemHeight + (triangleHeight / 2)}px)`
      } else {
        // pageItem 的 padding 值，以及 pageItem 的線寬
        var base_offset = `translateY(-0.5em) translateY(-1px)`
      }
      var add_offset = ` translateY(-${itemHeight * page_code}px)`

      list.css('transform', base_offset + add_offset)
    }
    '-open-' () {
      this.positingPageCode()
    }

    'initPageCode' () {
      const pageCodeElements = []
      const length = this.$page.page_list.length
      for (let current = 0; current < length; ++current) {
        const itemEle = $.create('div').class('page-selector-item').text(current + 1).pop()
        pageCodeElements.push(itemEle)

        this.$('.page-selector-list').append(itemEle)

        // itemEle.addEventListener('touchstart', e => {
        //
        // })
        itemEle.addEventListener('click', (current => e => {
          if (this.status) {
            e.preventDefault()
            e.stopPropagation()
            if (current === this.page_code) {
              document.body.click()
            } else {
              this.page_code = current
            }
          }
        })(current))
      }
      ObjectAssign(this, {
        pageCodeElements,
        page_code: this.$page.page_code,
      })
    }

    'construct' () {
      this.initPageCode()

      this.$page.on('page-code-changed', changed_page_code => {
        // alert(changed_page_code)
        // this.page_code = changed_page_code
      })
    }
  }

  class PageHighLight extends PageCode {
    '-pagecode-change-' (page_code) {
      this.pageCodeElements.forEach((ele, cursor) => {
        ele.style.color = (page_code === cursor) ? 'white' : ''
      })
    }
    'construct' () {
      this['-pagecode-change-'](this.page_code)
    }
  }

  class PreviousAction extends PageHighLight {
    'previous-滚动高度大于容器' (type, status) {
      this[`next-${status.effect_type}`](...arguments)
    }
    'previous-滚动高度不大于容器' (type, status) {
      this[`next-${status.effect_type}`](...arguments)
    }
    'previous-当前页和操作页高度不大于容器最小高度' (type, status) {
      this[`next-${status.effect_type}`](...arguments)
    }
    'previous-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度大于容器最小高度' (type, status) {
      this[`next-${status.effect_type}`](...arguments)
    }
    'previous-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this[`next-${status.effect_type}`](...arguments)
    }
    'previous-滚动高度不大于容器且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this[`next-${status.effect_type}`](...arguments)
    }
    'previous-操作页高度大于容器最小高度且当前页高度不大于容器最小高度' (type, status) {
      console.warn(this)
      this['next-滚动高度不大于容器'](...arguments)
    }
  }

  class NextAction extends PreviousAction {
    'next-滚动高度不大于容器' (type, status) {
      this.$(this.container).css('transform', `translateY(10em) translateY(2cm)`)
      status.on('done', () => {
        this.$('.page-selector-frame').removeCss('height')
        this.$(this.container).removeCss('transform', 'position')
      })
    }

    'next-当前页和操作页高度不大于容器最小高度' (type, status) {
      this.$('.page-selector-frame').removeCss('height')
      this.positingPageCode()
      status.on('done', () => {
        this.$(this.container).removeCss('transform', 'position')
      })
    }
    'next-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度大于容器最小高度' (type, status) {
      const minHeight = parseFloat(status.container.style.minHeight)
      const diff = status.operate.scrollHeight - minHeight

      this.$(this.container).css('transform', `translateY(${diff}px)`)
      this.$('.page-selector-frame').removeCss('height')
      this.positingPageCode()
      status.on('done', () => {
        this.$(this.container).removeCss('transform', 'position')
      })
    }
    'next-滚动高度大于容器高度且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this.$('.page-selector-frame').removeCss('height')
      this.positingPageCode()
      status.on('done', () => {
        this.$(this.container).removeCss('transform', 'position')
      })
    }
    'next-滚动高度不大于容器且操作页高度不大于视口高度且操作页高度不大于容器最小高度' (type, status) {
      this['next-当前页和操作页高度不大于容器最小高度'](...arguments)
    }
    'next-滚动高度大于容器' (type, status) {
      this.$(this.container).css('transform', `translateY(10em) translateY(2cm)`)
      status.on('done', () => {
        this.$('.page-selector-frame').removeCss('height')
        this.$(this.container).removeCss('transform', 'position')
      })
    }
  }

  class Action extends NextAction {
    'setPageCode' (page = this.page_code) {
      return this.$page.setPageCode(page)
    }

    '-open-' () {
      this._last_page_code_ = this.page_code
    }
    'open' () {
      this.status = true
      this.$(this.container).css('position', 'fixed')
      this.$('.page-selector-frame').css('height', '10em')
      this.emit('open')
    }

    'closeEffect' () {
      return wait_step(0, () => {
        this.positingPageCode()
        this.$('.page-selector-frame').removeCss('height')
        this.$(this.container).removeCss('position')
      })(getTransitionDuration(this.container), () => {
        this.emit('closed')
      })
    }
    'close' () {
      this.status = false
      const {$page} = this

      if (this._last_page_code_ === this.page_code) {
        return this.closeEffect()
      } else {
        const status = this.setPageCode(this.page_code)
        status.on('effect-type', type => {
          console.log('effect-type:', type)
          const prop = `${status.type}-${type}`
          this[prop] && this[prop](type, status)
        })
        status.on('done', type => {
          this.positingPageCode()
          this.emit('closed')
        })
      }

    }

    get status () {
      return this._status
    }
    set status (val) {
      this._status = val

      this.emit('status-change', this._status)

      return this._status = val
    }
    'construct' () {
      this.status = false
    }
  }

  class ScrollAction extends Action {
    '-status-change-' (status) {
      this.$scroller.enable = status
      this.$scroller.preventDefault = status
    }
    'construct' () {
      const scroller = new Scroller(window, this.$$('.page-selector-content'))
      this.$scroller = scroller

      scroll.enable = this.status

      scroller.on(['滾輪-上', '下滑'], () => {
        --this.page_code
      })
      scroller.on(['滾輪-下', '上滑'], () => {
        ++this.page_code
      })
      this['-status-change-'](this.status)
    }
  }

  class Scrolling extends ScrollAction {
    'construct' () {
      const ScrollingElement = getScrollingElement()
      let lastScrollTop = ScrollingElement.scrollTop
      let currentScrollTop = ScrollingElement.scrollTop
      let lock = false
      const toBottom = () => {
        if (this.$page.operating || this.status || lock) { return }
        lock = true

        const list = this.$$('.page-selector-list')
        $(list).css({
          transitionDuration: '.3s',
          marginTop: '0.75em'
        })
        wait_step(500, () => {
          $(list).removeCss('transitionDuration', 'marginTop')
          lock = false
        })
        return

        const frame = this.$$('.page-selector-frame')
        let diff = currentScrollTop - lastScrollTop
        console.log(`${parseFloat(getComputedStyle(frame)['height']) + (diff)}px`)
        if (diff > 24) {
          diff = 12
          $(frame).css({
            transitionDuration: '.3s',
            height: `${parseFloat(getComputedStyle(frame)['height']) + (diff)}px`,
          })
          wait_step(150, () => {
            $(frame).removeCss('transitionDuration', 'height')
          })
        } else {
          const list = this.$$('.page-selector-list')
          $(list).css({
            transitionDuration: '.3s',
            marginTop: '0.75em'
          })
          wait_step(150, () => {
            $(list).removeCss('transitionDuration', 'marginTop')
          })
          return
        }


      }
      window.onscroll = e => {
        lastScrollTop = currentScrollTop
        currentScrollTop = ScrollingElement.scrollTop

        if ((currentScrollTop + window.innerHeight) >= ScrollingElement.scrollHeight) {
          toBottom()
        }
      }
    }
  }

  class Layer extends Scrolling {
    '-status-change-' (status) {
      if (status) {
        $(document.body).css('cursor', 'pointer')
      } else {
        $(document.body).removeCss('cursor')
      }
    }

    'construct' () {
      this.$$('.page-selector-content').addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        if (!this.status) {
          this.open()
        } else {
          this.close()
        }
      })

      document.body.addEventListener('click', e => {
        if (this.status) {
          e.preventDefault()
          e.stopPropagation()
          this.close()
        }
      })
    }
  }

  class PageSelector extends Layer {

  }

  return PageSelector
}

const PageSelector = PageSelectorClass()
