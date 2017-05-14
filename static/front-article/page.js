// 分頁的一些策略
// 該功能需要後端支持（預渲染
// 先將 .page 元素隱藏（頁
// 再顯示出 .current-page 元素（當前頁
// 計算 .current-page 的位置（確定頁碼和總頁數
const Page = {
  prototype: EventLite.create({
    createFramePromise(obj) {
      return new Promise((res, rej) => {
        obj.resolve = res
        obj.reject = rej
      })
    },
    frame(...ops) {
      let status = false
      let stop = false
      let wait = false
      let waitPromiseHandle = {}
      let waitPromise
      const opAction = (async () => {
        for (let c = 0; c < ops.length; ++c) {
          if (wait) await waitPromise
          if (stop) break
          await ops[c]()
          await waitting(32)
        }
        status = true
      })()
      opAction.stop = () => { stop = true }
      opAction.pause = () => {
        waitPromise = this.createFramePromise(waitPromiseHandle)
        wait = true
      }
      opAction.resume = function () {
        wait = false
        waitPromiseHandle.resolve()
      }
      Object.defineProperty(opAction, 'status', {
        get() { return status },
      })

      return opAction
    },
    setHidden(page) {
      return page.style.display = 'none'
    },
    removeHidden(page) {
      return page.style.display = ''
    },
    getPageCodeByElement(pageElement) {
      return this.pages.indexOf(pageElement)
    },
    getPage(pageCode = this.pageCode) {
      return this.pages[pageCode]
    },
    setCurrent(page = this.getPage()) {
      this.pages.forEach(ele => {
        if (ele === page) {
          this.getPageCodeByElement(ele)
          this.removeHidden(ele)
          ele.setAttribute('current', '')
        } else {
          if (ele.scrollHeight >= window.innerHeight) {
            ele.style.height = `${window.innerHeight}px`
          }
          this.setHidden(ele)
          ele.removeAttribute('current')
        }
      })
    },
    /**
      視口的高度是否在文章元素中
      @return {Boolean}
    */
    isViewportInArticleContainer(){
  		/* 兼容 IE11 */
  		const scrollableElementScrollTop = $$('html').scrollTop || $$('body').scrollTop || 0
  		return scrollableElementScrollTop > this.container.offsetTop
  	},

    __pageCode: 0,
    get pageCode() {
      return this.__pageCode
    },
    set pageCode(value) {
      // 如果不是整數
      if (parseInt(value) !== value) {
        console.warn('this:', this)
        console.warn('value:', value)
        throw new Error('設定的 pageCode 不是一個整數')
      }
      if (value < 0) {
        throw new Error(`設定的 pageCode(${value}) 不能小於 0`)
      }

      if (value >= (this.pages.length)) {
        console.warn(`設定的 pageCode(${value}) 大於等於最大頁碼限制(${this.pages.length})`)
        return this.pages.length
      }

      if (value > this.__pageCode) {
        var actionMethod = 'next'
      } else if (value < this.__pageCode) {
        var actionMethod = 'previous'
      } else {
        // 設定相同值是不會有什麼反應的
        return this.__pageCode
      }

      // 同時也不會相應換頁操作
      this[actionMethod + 'Action'](
        this.getPage(this.__pageCode),
        this.getPage(value)
      )

      this.emit('change', value)

      return (this.__pageCode = value)
    },

    /**
      上一頁
      @param {Object} current 當前頁的元素
      @param {Object} previous 上一頁的元素
    */
    previousAction(current, previous) {
      ObjectAssign(this, {
        __actionType: 'previous',
        __operator: previous,
        __current: current,
      })
      console.time('frame_time')
      // $([current, previous]).class('switching')
      if (this.isViewportInArticleContainer()) {
        previous.style.top = '0em'
        previous.style.position = 'fixed'
      }

      previous.style.display = ''

      current.style.opacity = '1'
      current.style.position = 'absolute'

      current.style.top = '0em'
      setTimeout(() => {
        this.emit('action', current, previous)

        current.style.top = '1em'
        current.style.opacity = '0'
        previous.style.opacity = '1'

        const waitTime = parseFloat(getComputedStyle(current).transitionDuration) * 1000
        setTimeout(() => {
          if (this.isViewportInArticleContainer()) {
            scrollTo(document.body, this.container.offsetTop)
            previous.style.position = ''
          }
          this.setCurrent(previous)
          $(previous).removeCss('top', 'height')
          $(current).removeCss('position', 'opacity', 'top')

          ObjectAssign(this, {
            __actionType: 'waitting',
            __operator: null,
            __current: null,
          })
        }, waitTime)
      }, 18)
    },
    /**
      下一頁
      @param {Object} current 當前頁的元素
      @param {Object} next 下一頁的元素
    */
    nextAction(current, next) {
      ObjectAssign(this, {
        __actionType: 'next',
        __operator: next,
        __current: current,
      })
      console.time('frame_time')

      // this.removeHidden(next)
      next.style.display = ''
      next.style.position = 'absolute'
      next.style.top = '1em'
      next.style.opacity = '0'
      setTimeout(() => {
        this.emit('action', current, next)
        if (this.isViewportInArticleContainer()) {
          next.style.position = 'fixed'
        }
        $(next).css({
          top: '0em',
          opacity: 1,
        })
        $(current).css('opacity', 0)
        setTimeout(() => {
          if (this.isViewportInArticleContainer()) {
            next.style.position = ''
            scrollTo(document.body, this.container.offsetTop)
          }
          this.setCurrent(next)
          $(next).removeCss('height', 'position', 'top', 'opacity')

          ObjectAssign(this, {
            __actionType: 'waitting',
            __operator: null,
            __current: null,
          })
          console.timeEnd('frame_time')
        }, 618 + 32)
      }, 18)
    },
  }),
  _prototypeInit() {
    const pages = $('.page', this.container)
    this.pages = pages
    this.pageCode = 0
    pages.class('split-page')
    this.setCurrent()

    const onscroll = e => {
      if (this.isViewportInArticleContainer()) {
        $(this.container).class('morethan-article')
      } else {
        $(this.container).classRemove('morethan-article')
      }
    }
    window.addEventListener('scroll', onscroll)
    onscroll()

    const onResize = e => {
      this.container.style.minHeight = `${
        window.innerHeight -
        $$('.top-block').offsetHeight -
        $$('.page-selector').offsetHeight
      }px`
    }
    onResize()
    window.addEventListener('resize', onResize)

    // this.container.style.transition = 'min-height 618ms'
    // this.on('action', (current, operator) => {
    //   console.warn(operator.offsetHeight)
    //   if (current.offsetHeight > operator.offsetHeight) {
    //     // this.container.style.minHeight = `${current.offsetHeight}px`
    //   } else if (current.offsetHeight < operator.offsetHeight){
    //     // this.container.style.minHeight = `${operator.offsetHeight}px`
    //   }
    //   this.container.style.minHeight = `${operator.offsetHeight}px`
    //
    //   // if (operator.offsetHeight < window.innerHeight) {
    //   //   this.container.style.minHeight = `${window.innerHeight - $$('.top-block').offsetHeight - $$('.page-selector').offsetHeight}px`
    //   // }
    // })

    $(this.container).class('page-standby')

    this.pages.forEach(pageEle => {
      Han(pageEle).render()
    })
  },
  init(splitPageContainer) {
    const instance = Object.create(this.prototype)
    instance.container = splitPageContainer
    this._prototypeInit.apply(instance, arguments)
    return instance
  },
}

pa_init(async () => {
  window.page = Page.init($$('#article'))

  window.topSwitcher = new Switcher(
    window.page,
    $$('.top.page-btn-panel .previous'),
    $$('.top.page-btn-panel .next')
  )

  window.selector = PageSelector.init($$('.page-selector'), window.page)
})
