// 分頁的一些策略
// 該功能需要後端支持（預渲染
// 先將 .page 元素隱藏（頁
// 再顯示出 .current-page 元素（當前頁
// 計算 .current-page 的位置（確定頁碼和總頁數
const Page = {
  prototype: EventLite.create({
    async frame(...ops) {
      for (let c = 0; c < ops.length; ++c) {
        await ops[c]()
        await waitting(32)
      }
      return this
    },
    setHidden(page) {
      return this.frame(() => {
        page.setAttribute('hidden', '')
      })
    },
    removeHidden(page) {
      return this.frame(() => {
        page.removeAttribute('hidden', '')
      })
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
        return this.__pageCode
      }
      // 設定相同值是不會觸發 change 事件的
      this.emit('change', value)

      this[actionMethod + 'Action'](
        this.getPage(this.__pageCode),
        this.getPage(value)
      )

      return (this.__pageCode = value)
    },

    /**
      上一頁
      @param {Element} current 當前頁的元素
      @param {Element} previous 上一頁的元素
    */
    previousAction(current, previous) {
      this.frame(
        () => $([current, previous]).class('switching'),
          () => $(previous).class('up'),
          () => this.removeHidden(previous),
          () => $(current).class('down'),
          () => waitting(618),
          () => {
            if (this.isViewportInArticleContainer()) {
              scrollTo(document.body, this.container.offsetTop)
            }
          },
          () => this.setCurrent(previous),
        () => $([current, previous]).classRemove('switching', 'down', 'up')
      )
    },
    /**
      下一頁
      @param current 當前頁的元素
      @param next 下一頁的元素
    */
    nextAction(current, next) {
      return this.frame(
        () => $([current, next]).class('switching'),
          () => this.removeHidden(next),
          () => $(next).class('up'),
          () => waitting(618),
          () => {
            if (this.isViewportInArticleContainer()) {
              scrollTo(document.body, this.container.offsetTop)
            }
          },
          () => this.setCurrent(next),
        () => $([current, next]).classRemove('switching', 'up')
      )
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

    $(this.container).class('page-standby')
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

  switchPage()
})
