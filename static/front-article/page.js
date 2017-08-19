const wait_step = (timeout, fn) => {
  setTimeout(fn, timeout)
  return function (timeout_c, fn_c) {
    if (arguments.length === 1) {
      fn_c = timeout_c
      timeout_c = 20
    }
    return wait_step(timeout + timeout_c, fn_c)
  }
}

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

    previousAction_short(current, previous) {
      const waitTime = parseFloat(getComputedStyle(current).transitionDuration) * 1000

      previous.style.transform = 'translateY(-1em)'
      previous.style.display = 'none'

      current.style.bottom = '0'
      current.style.position = 'fixed'

      return wait_step(20, () => {
        previous.style.display = ''
      })(20, () => {
        current.style.opacity = '0'
        current.style.bottom = '-1em'

        previous.style.opacity = 1
        previous.style.transform = 'translateY(0em)'
      })(waitTime + 20, () => {
        this.emit('action', current, previous)

        this.setCurrent(previous)
        previous.style.transform = ''

        current.style.position = ''
        current.style.opacity = ''
        current.style.bottom = ''

        this.emit('action-completed', this.__action)
        this.__actionType = 'waitting'
        this.__operator = null
        this.__current = null
        console.timeEnd('frame_time')
      })
    },
    /**
      上一頁
      @param {Object} current 當前頁的元素
      @param {Object} previous 上一頁的元素
    */
    previousAction(current, previous) {
      const actionObj = {
        __actionType: 'previous',
        __operator: previous,
        __current: current,
      }
      ObjectAssign(this, actionObj)
      this.__action = actionObj

      // $([current, previous]).class('switching')

      // previous.style.zIndex = 999
      const clearZIndex = () => { previous.style.zIndex = '' }
      previous.style.display = ''
      this.emit('pre-action', actionObj)
      this.emit(`pre-${actionObj.__actionType}`, actionObj)
      console.time('frame_time')

      if (this.isViewportInArticleContainer() && this.pageEleTooShort(previous)) {
        console.log('下一頁太短')
        return this.previousAction_short(current, previous)(16, clearZIndex)
      }

      if (this.isViewportInArticleContainer()) {
        previous.style.position = 'fixed'
      } else {
        previous.style.position = 'absolute'
      }
      previous.style.top = '0em'
      previous.style.display = ''

      current.style.opacity = '1'
      current.style.transform = 'translateY(0em)'

      // return;

      const waitTime = parseFloat(getComputedStyle(current).transitionDuration) * 1000
      return wait_step(20, () => {
        this.emit('action', current, previous)

        current.style.transform = 'translateY(1em)'
        current.style.opacity = '0'
        previous.style.opacity = '1'
      })(waitTime + 20, () => {
        if (this.isViewportInArticleContainer()) {
          scrollTo(document.body, this.container.offsetTop)
        }

        previous.style.top = ''
        previous.style.height = ''
        previous.style.position = ''
        this.setCurrent(previous)

        current.style.position = ''
        current.style.opacity = ''
        current.style.transform = ''
        current.style.top = ''

        this.emit('action-completed', this.__action)
        this.__actionType = 'waitting'
        this.__operator = null
        this.__current = null
        console.timeEnd('frame_time')
      })(16, clearZIndex)
    },


    nextAction_short(current, next) {
      current.style.bottom = '0'
      current.style.position = 'fixed'

      const waitTime = parseFloat(getComputedStyle(current).transitionDuration) * 1000
      return wait_step(20, () => {
        next.style.top = '0em'
        next.style.opacity = '1'

        current.style.bottom = '1em'
        current.style.opacity = '0'
        scrollTo(document.body, 0)
      })(waitTime + 20, () => {
        this.emit('action', current, next)
        this.setCurrent(next)
        current.style.bottom = ''
        current.style.position = ''

        next.style.position = ''
        next.style.height = ''
        next.style.top = ''
        next.style.opacity = ''

        this.emit('action-completed', this.__action)
        this.__actionType = 'waitting'
        this.__operator = null
        this.__current = null
        console.timeEnd('frame_time')
      })
    },

    pageEleTooShort(ele) {
      console.warn('page short?', ele.scrollHeight)
      const ele_height = ele.scrollHeight
      return ele_height < window.innerHeight
    },

    /**
      下一頁
      @param {Object} current 當前頁的元素
      @param {Object} next 下一頁的元素
    */
    nextAction(current, next) {
      const actionObj = {
        __actionType: 'next',
        __operator: next,
        __current: current,
      }
      ObjectAssign(this, actionObj)

      console.time('frame_time')

      // this.removeHidden(next)
      next.style.position = 'absolute'
      next.style.top = '1em'
      next.style.opacity = '0'
      next.style.display = ''
      const clearZIndex = () => { next.style.zIndex = '' }

      this.emit('pre-action', actionObj)
      this.emit(`pre-${actionObj.__actionType}`, actionObj)

      if (this.isViewportInArticleContainer() && this.pageEleTooShort(next)) {
        console.log('下一頁太短')
        return this.nextAction_short(current, next)(16, clearZIndex)
      }

      next.style.height = '100vh'
      const waitTime = parseFloat(getComputedStyle(current).transitionDuration) * 1000
      return wait_step(20, () => {
        this.emit('action', current, next)
        if (this.isViewportInArticleContainer()) {
          console.log('isViewportInArticleContainer')
          next.style.position = 'fixed'
        }

        next.style.top = '0em'
        next.style.opacity = '1'

        current.style.opacity = '0'
      })(waitTime + 20, () => {
        if (this.isViewportInArticleContainer()) {
          next.style.position = ''
          scrollTo(document.body, this.container.offsetTop)
        }
        this.setCurrent(next)

        next.style.position = ''
        next.style.height = ''
        next.style.top = ''
        next.style.opacity = ''

        this.emit('action-completed',this.__action)
        this.__actionType = 'waitting'
        this.__operator = null
        this.__current = null
        console.timeEnd('frame_time')
      })(16, clearZIndex)
    },
  }),
  // minHeightCompute() {
  //   this.articleMinHeight = window.innerHeight - $$('.top-block').offsetHeight
  //   this.container.style.minHeight = `calc(${this.articleMinHeight}px - 16px)`
  // },
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

    const resize_handle = e => {
      this.articleMinHeight = window.innerHeight - $$('.top-block').offsetHeight
      this.container.style.minHeight = `${this.articleMinHeight}px`
      // this.container.style.height = `${this.container.scrollHeight}px`
      $('.page', this.container).forEach(ele => {
        ele.style.minHeight = `${this.articleMinHeight}px`
      })
    }
    resize_handle()
    window.addEventListener('resize', resize_handle)
    // console.warn(this.minHeightCompute)
    // this.minHeightCompute()

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
  window.sourcode = new SourceCode(window.page.container)
  window.metaImage = new MetaImageFrame(document.getElementById('article'))

  window.selector = PageSelector.init($$('.page-selector'), window.page)

  window.topSwitcher = new Switcher(
    window.page,
    $$('.top.page-btn-panel .previous'),
    $$('.top.page-btn-panel .next')
  )

	window.topSwitcher
  .on('next', () => {
		window.selector.status = true
		window.page.pageCode = ++window.selector.currentPageCode
	})
	.on('previous', () => {
		window.selector.status = false
		window.page.pageCode = --window.selector.currentPageCode
	})
})
