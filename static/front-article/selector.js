class Scroller {
	/* 设定滚动事件
	direct 為 true 時為滾輪上，false 時為滾輪下
	*/
	setWheelEvent(ele = window) {
    this.enable = false
		const scrollFunc = (e) => {
			e = e || window.event
      if (!this.enable) { return }
      if (this.preventDefault) {
        e.preventDefault()
      }

			let direct = (e.wheelDelta || e.detail) > 0
			if (e.wheelDelta === undefined) {
				// firefox
				direct = !direct
			}
			this.emit(`滾輪-${direct ? '上' : '下'}`)
		};

		if (ele.onmousewheel !== undefined) {
			// IE/Opera/Chrome
			document.addEventListener('mousewheel', scrollFunc, true)
		} /*else if (ele.onwheel !== undefined) {
			// fireFox new
			ele.onwheel = scrollFunc
		} */else {
			// fireFox old
			document.addEventListener('DOMMouseScroll', scrollFunc, true)
		}
	}
	setTouchEvent(touchEle) {
		let 滑動靈敏度 = 75
		let status = {
			x: 0,
			y: 0,
		}
		let directMiddle = e => {
			if (status.lastY > e.touches[0].clientY) {
				/* 上一次觸點比這一次高（上滑方向） */
				if (status.scrollUpDirect !== true) {
					status.y = e.touches[0].clientY
					status.scrollUpDirect = true
				}
			} else {
				if (status.scrollUpDirect !== false) {
					status.y = e.touches[0].clientY
					status.scrollUpDirect = false
				}
			}
		}
		window.addEventListener('touchstart', e => {
			this.isTouch = true
			status.x = e.touches[0].clientX
			status.y = e.touches[0].clientY
			status.startY = e.touches[0].clientY

			directMiddle(e)
		})
		window.addEventListener('touchend', e => {
			this.isTouch = false
		})
		window.addEventListener('touchmove', e => {
      if (!this.enable) { return }
			directMiddle(e)
			status.lastY = e.touches[0].clientY

			if (this.preventDefault) {
				e.preventDefault()
			}

			let diffY = status.y - e.touches[0].clientY
			if (Math.abs(diffY) < 滑動靈敏度) {
				return
			}
			status.y = e.touches[0].clientY

			/* 觸摸點在開始點上方 */
			if (diffY > 0) {
				this.emit('上滑')
			} else {
				this.emit('下滑')
			}
		}, { passive: false })

	}
	constructor(scrollEle = window, touchEle = window) {
		this.setWheelEvent(scrollEle)
		this.setTouchEvent(touchEle)
	}
}
Scroller.prototype.__proto__ = Object.create(EventLite)

const PageSelector = {
  constructHooks: [
    /* 換頁按鈕 */
    function () {
      const previous = $$('.previous', this.container)
      const next = $$('.next', this.container)
      this.ele.set({previous, next})
      const switcher = new Switcher(this.page, previous, next)
			switcher.on('click', type => {
				this.container.style.opacity = '0'
				setTimeout(() => {
					this.container.style.opacity = ''
				}, 700)
				if (this.__openAfterCurrentPageCode === this.currentPageCode) {
					// 頁碼沒有變化
				} else if (this.page.isViewportInArticleContainer() || (page.__operator.offsetHeight >= innerHeight)) {
					// 視口在文章容器內 或者 換頁 operator 元素的高度大於等於視口瀏覽器內容框高度

				} else if (false && page.__operator.offsetHeight > innerHeight) {
				} else {

				}

			})

      let lastPageCode = this.currentPageCode
      this.on('open', async () => {
        $([previous, next]).css('opacity', 0)
        await waitting(618)
      })
      this.on('close', async () => {
        await waitting(618)
        $([previous, next]).removeCss('opacity')
      })
    },
    /* 打開/關閉 跳頁對話框 */
    function () {
      const {ele} = this
      ele.set({
        'frame': $$('.page-selector-frame', this.container),
        'content': $$('.page-selector-content', this.container)
      })
      ele['content'].addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()
        this.status || this.open()
      })

      // const bg = $('.page-selector-bg')
			const $body = $(document.body)
      document.body.addEventListener('click', e => {
				this.submitPage()
				if (this.status) {
					e.preventDefault()
					e.stopPropagation()
					this.close()
				}
      })
      this.on('open', () => {
        $body.css('cursor', 'pointer')
      })
      this.on('close', () => {
        $body.removeCss('cursor')
      })

      // const scrollHandle = e => {
      //   if (window.pageYOffset + screen.height >= document.body.offsetHeight) {
      //     this.show()
      //   } else {
      //     this.hide()
      //   }
      // }
      // window.addEventListener('scroll', scrollHandle)
      // scrollHandle()
    },
    /* 初始化三角形 */
    function () {
      const {ele} = this
      ele.set({triangle: $$('.selector-triangle', this.container)})
      this.on('open', () => {
        ele.get('triangle').css({transform: `translateY(5em)`})
      })
      this.on('close', () => {
        ele.get('triangle').removeCss('transform')
      })
    },
    /* 初始化頁碼 */
    function () {
      this.ele.set({
        'list': $$('.page-selector-list', this.container)
      })
      this.setPageCode()

      this.on('status-change', () => { this.currentPageCode = this.currentPageCode })

      /* 跳頁對話框開啟狀態時不會應用頁碼改變的事件 */
      this.page.on('change', pageCode => {
        if (!this.status) {
          console.warn('!!');
          this.currentPageCode = pageCode
        }
      })
			const currentPageCodeChangeHandle = pageCode => {
				this.pageCodeElements.forEach((ele, cursor) => {
					ele.style.color = (pageCode === cursor) ? 'white' : ''
				})
			}
			this.on('currentPageCode-change', currentPageCodeChangeHandle)
			currentPageCodeChangeHandle(this.page.pageCode)
    },
    /* 初始化滾動 */
    function () {
      const scroller = new Scroller(window, this.ele['content'])
      this.scroller = scroller

      this.on('status-change', status => {
        scroller.enable = status
        scroller.preventDefault = status
      })
      scroll.enable = this.status

      scroller.on(['滾輪-上', '下滑'], () => {
        --this.currentPageCode
      })
      scroller.on(['滾輪-下', '上滑'], () => {
        ++this.currentPageCode
      })
    },

  ],
  prototype: EventLite.create({
    __status: false,
    get status() { return this.__status },
    set status(value) {
      this.__status = Boolean(value)
      this.emit('status-change', this.__status)
    },
    open() {
			this.ele.get('container').css('position', 'fixed')
      this.__openAfterCurrentPageCode = this.currentPageCode
      this.status = true
      this.ele.get('frame').css('height', '10em')
      this.emit('open')
    },
    close() {
      this.status = false
			const {ele} = this
			if (this.__openAfterCurrentPageCode === this.currentPageCode) {
				ele.get('frame').removeCss('height')
				setTimeout(() => {
					ele.get('container').removeCss('position')
					this.emit('close')
				}, 700)
			} else if (this.page.isViewportInArticleContainer() || (page.__operator.offsetHeight >= innerHeight)) {
				ele.get('frame').css('height', '0em')
				setTimeout(() => {
					ele.get('container').removeCss('position')
					ele.get('frame').removeCss('height')
					this.emit('close')
				}, 700)
			} else if (false && page.__operator.offsetHeight > innerHeight) {


			} else {
				ele.get('frame').removeCss('height')
				setTimeout(() => {
					ele.get('container').removeCss('position')
					this.emit('close')
				}, 700)
			}

    },
    show() {
      // $(this.container).css('bottom', '0em')
    },
    hide() {
      // $(this.container).removeCss('bottom', '')
    },
    submitPage(page = this.currentPageCode) {
      this.page.pageCode = page
    },
    __currentPageCode: 0,
    get currentPageCode() { return this.__currentPageCode },
    /* 頁碼變換時會重新計算位置 */
    set currentPageCode(value) {
      if (parseInt(value) !== value) {
        console.warn('this:', this)
        console.warn('value:', value)
        throw new Error('設定的 currentPageCode 不是一個整數')
      }
      if (value < 0) {
        return console.warn(`設定的 currentPageCode(${value}) 不能小於 0`)
      }

      if (value >= (this.page.pages.length)) {
        return console.warn(`設定的 currentPageCode(${value}) 大於等於最大頁碼限制(${this.page.pages.length})`)
      }

      const list = this.ele.get('list')
      const pageItem = $$('.page-selector-item', this.container)
      if (this.status) {
        // pageItem 的 padding 值，以及 pageItem 的線寬
        var base_offset = `translateY(${pageItem.offsetHeight}px) translateY(-1px)`
      } else {
        // pageItem 的 padding 值，以及 pageItem 的線寬
        var base_offset = `translateY(-0.5em) translateY(-1px)`
      }
      var add_offset = ` translateY(-${pageItem.offsetHeight * value}px)`

			list.css('transform', base_offset + add_offset)

      this.__currentPageCode = value
			this.emit('currentPageCode-change', this.__currentPageCode)
    },
    setPageCode() {
			const pageCodeElements = []
      const length = this.page.pages.length
      for (let current = 0; current < length; ++current) {
        const itemEle = $.create('div').class('page-selector-item').text(current + 1).pop()
				pageCodeElements.push(itemEle)
        this.ele.get('list').append(itemEle)
				itemEle.addEventListener('click', (current => e => {
					if (this.status) {
						e.preventDefault()
						e.stopPropagation()
						if (current === this.currentPageCode) {
							document.body.click()
						} else {
							this.currentPageCode = current
						}
					}
				})(current))
      }
			ObjectAssign(this, {
				pageCodeElements,
				currentPageCode: this.page.pageCode,
			})
    },
  }),
  ElementConstructor: class {
    set(name, fn) {
      return ObjectAssign(
        this,
        (typeof(name) === 'string') ? {name: fn} : name
      )
    }
    get() {
      const eles = Array.prototype.slice.apply(arguments).map(name => this[name])
      return $(eles)
    }
    throwError(msg) { throw new Error(msg) }
    constructor(container = this.throwError('沒有指定容器')) {
      this.container = container
    }
  },
  _prototypeInit(instance) {
    instance.ele = new this.ElementConstructor(instance.container)
    this.constructHooks.forEach(fn => fn.apply(instance))
  },
  init(container, page) {
    const instance = Object.create(this.prototype)
    ObjectAssign(instance, {
      page,
      container,
    })
    this._prototypeInit(instance, ...arguments)

		if (page.pages.length <= 1) {
			console.info('不足二頁的情況自動隱藏 Selector')
			instance.container.style.display = 'none'
		}

    return instance
  },
}
