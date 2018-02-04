/*
  优秀的功能
  不使用 EventLite ，换成 async-call，因为需要异步事件机制

  支持配套首字下沉
 */

class Split {
  'clearArrow' () {
    $('a.footnote-backref', this.splitContainer).remove()
  }

  createSplitElement(footnoteContent) {
    const ele = document.createElement('div')
    $(ele).class('split')

    const contentEle = document.createElement('div')
    $(contentEle).class('split-content').html(footnoteContent)
    $(ele).append(contentEle)

    this.contentContainer = contentEle

    return ele
  }

  getSplitContentElement() {
    return $$('.split-content', this.splitContainer)
  }

  createInitialSplitElement(contentHtml = this.getSplitContentElement().innerHTML) {
    let splitEle
    if (this.initialSplitContainer) {
      splitEle = this.initialSplitContainer
    } else {
      splitEle = document.createElement('div')
      splitEle.className = 'initial-split'

      this.paraContainer.parentNode.insertBefore(splitEle, this.paraContainer)

      $(splitEle).html(`<div class="initial-content">${contentHtml}</div>`)
      this.initialContentContainer = $$('.initial-content', splitEle)
      this.initialSplitContainer = splitEle
    }
  }

  'initialLayerAdjust' () {
    $(this.initialSplitContainer).css({
      transform: `translateX(-${this.paraContainer.offsetLeft}px)`
    })

    if (document.body.offsetWidth >= 800) {
      $(this.initialContentContainer).css({
        padding: `1.5em ${(document.body.offsetWidth / 2) - (760 / 2)}px`
      })
    } else {
      $(this.initialContentContainer).removeCss('padding')
    }
  }

  async initialSlideDown() {
    this.initial_status = true

    this.createInitialSplitElement()

    await waitting(1000 / 60)

    this.initialLayerAdjust()

    await waitting(1000 / 60)

    const lineHeight = getComputedStyle(this.paraContainer).lineHeight
    const contentHeight = this.initialContentContainer.offsetHeight
    const transitionDuration = `${(contentHeight + parseFloat(lineHeight)) / this.speed}ms`

    $(this.initialSplitContainer).css({
      transitionDuration,
      height: `${contentHeight}px`
    })

    return transitionDurationWait(this.initialSplitContainer).then(() => {
      $(this.initialSplitContainer).class('slidedowned')
      $(this.initialSplitContainer).css({
        'height': 'auto',
        'transitionDuration': '0s',
      })

      return waitting(1000 / 60)
    })
  }

  roundFun(value, n) {
    return Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
  }
  'layerAdjustOffset' () {
    const jackParentLineHeight = parseFloat(getComputedStyle(this.jackContainer.parentNode)['line-height'])
    const supContainerHeight = this.supContainer.offsetHeight
    // console.warn()
    const diff = (jackParentLineHeight - supContainerHeight) / 2
    $(this.splitContainer).css('transform', `translateY(${this.roundFun(jackParentLineHeight - diff / 2, 1)}px)`)
    $(this.jackContainer).css('height', `${parseFloat(jackParentLineHeight - diff)}px`)
  }

  'layerAdjustHeight' () {
    const contentEle = this.getSplitContentElement()
    const {scrollHeight} = contentEle
    const jackParentLineHeight = getComputedStyle(this.jackContainer.parentNode)['line-height']

    console.warn(scrollHeight, jackParentLineHeight)

    $(this.jackContainer).css({
      height: `${scrollHeight + parseFloat(jackParentLineHeight)}px`,
    })

    $(this.splitContainer).css({
      height: `${scrollHeight}px`,
      // top: `${splitContainerTop}px`,
      top: '0px',
    })
  }

  'layerAdjust' () {
    $(this.splitContainer).css({
      width: `${document.body.offsetWidth}px`,
      left: `-${this.splitContainer.parentNode.offsetLeft}px`,
    })
    if (document.body.offsetWidth >= 800) {
      $(this.contentContainer).css({
        padding: `1.5em ${(document.body.offsetWidth / 2) - (760 / 2)}px`
      })
    } else {
      $(this.contentContainer).removeCss('padding')
    }
  }

  get speed () {
    return .25
  }

  async normalSlideDown() {
    this.normal_status = true

    $('.split-content', this.splitContainer).css('display', '')
    $(this.splitContainer).css('display', '')
    $(this.jackContainer).css('display', '')
    // await waitting(1000 / 30)

    this.layerAdjust()
    this.layerAdjustOffset()

    const speed = this.speed
    const contentEle = this.getSplitContentElement()
    const {scrollHeight} = contentEle
    const {parentNode} = this.jackContainer
    const parentLineHeight = getComputedStyle(parentNode).lineHeight
    const jackParentLineHeight = getComputedStyle(this.jackContainer.parentNode)['line-height']
    console.warn(parentLineHeight, jackParentLineHeight)
    // const refParent = this.refContainer.parentNode
    // const refParentLineHeight = getComputedStyle(refParent).lineHeight

    this.jackTransitionDuration = (scrollHeight + parseFloat(parentLineHeight)) / speed
    $([this.jackContainer, this.splitContainer]).css({
      transitionDuration: `${this.jackTransitionDuration}ms`,
    })

    await waitting(1000 / 60)

    $(this.jackContainer).css({
      height: `${scrollHeight + parseFloat(jackParentLineHeight)}px`,
    })

    // await waitting(parseFloat(parentLineHeight) / speed)
    this.splitTransitionDuration = scrollHeight / speed
    let splitContainerTop;

    splitContainerTop = this.jackContainer.offsetTop

    $(this.splitContainer).css({
      height: `${scrollHeight}px`,
      // top: `${splitContainerTop}px`,
      top: '0px',
    })

    await waitting(scrollHeight / speed)

    $(this.jackContainer).class('slidedowned')
    $(this.splitContainer).class('slidedowned')
  }

  async slideDown() {
    this.status = true

    await this.emit('slide-down')

    if (this.hasInitial() && this.canUseInitialSplitLayer()) {
      return this.initialSlideDown()
    } else {
      return this.normalSlideDown()
    }
  }

  async initialSlideUp() {
    this.initial_status = false

    $(this.initialSplitContainer).css({
      height: `${this.initialContentContainer.offsetHeight}px`,
    })

    await waitting(1000 / 60)

    $(this.initialSplitContainer).css({
      transitionDuration: '',
      height: '0px',
    })

    return transitionDurationWait(this.initialSplitContainer)
  }

  async normalSlideUp () {
    this.normal_status = false

    $(this.splitContainer).css({
      height: `0px`,
    })

    const jackParentLineHeight = parseFloat(getComputedStyle(this.jackContainer.parentNode)['line-height'])
    const supContainerHeight = this.supContainer.offsetHeight
    const diff = (jackParentLineHeight - supContainerHeight) / 2
    $(this.jackContainer).css('height', `${parseFloat(jackParentLineHeight - diff)}px`)

    await waitting(this.jackTransitionDuration)
    $(this.jackContainer)/*.css('display', 'none')*/.classRemove('slidedowned')
    $(this.splitContainer).classRemove('slidedowned')
    // $('.split-content', this.splitContainer).css('display', 'none')
    await waitting(1000 / 30)
  }
  async slideUp() {
    this.status = false

    if (this.hasInitial() && this.canUseInitialSplitLayer()) {
      return this.initialSlideUp()
    } else {
      return this.normalSlideUp()
    }
  }

  getInitial () {
    return $$('.initial', this.paraContainer)
  }

  // 是否有首字下沉的情况
  hasInitial() {
    return this.getInitial() || false
  }
  // 首字下沉用的裂层 是否可用
  canUseInitialSplitLayer() {
    // if (!this.initialSplitContainer) {
    //   return false
    // }

    const initial_top = this.getInitial().offsetTop,
      initial_height = this.getInitial().offsetHeight,
      sup_top = this.supContainer.offsetTop,
      line_height = parseFloat(getComputedStyle(this.paraContainer)['line-height'])

    return !((sup_top + line_height) >= (initial_top + initial_height))
  }


  get status () {
    return this._status
  }
  set status (val) {
    this._status = val
    if (this._status) {
      this.supContainer.classList.add('split-on')
    } else {
      this.supContainer.classList.remove('split-on')
    }

    return this._status
  }

  'constructor' (parent, ref, html) {
    AsyncCall.mixin(this)

    this.parent = parent

    this.paraContainer = ref.parentNode.parentNode
    if (this.hasInitial()) {
      this.paraContainer.classList.add('initial-p')
    }

    const splitEle = this.createSplitElement(html)

    const jack = document.createElement('div')
    $(jack).class('jack')

    // ref.parentNode.parentNode.insertBefore(splitEle, ref.parentNode)
    $(ref.parentNode).append(splitEle)
    // splitEle.parentNode.insertBefore(jack, splitEle)

    /* 锚后面如果是标点符号（Han 的 h-char 元素表示），则加到 ref 中 */
    const nextSibling = ref.parentNode.nextElementSibling
    if (nextSibling && (nextSibling.nodeType === 1) && (nextSibling.tagName.toLowerCase() === 'h-char')) {
      $(nextSibling).remove()
      ref.parentNode.appendChild(nextSibling)
      console.warn(nextSibling)
    }
    ref.parentNode.parentNode.insertBefore(jack, ref.parentNode.nextSibling)
    $(splitEle.parentNode).css('position', 'relative')

    this.splitContainer = splitEle
    this.refContainer = ref
    this.supContainer = ref.parentNode
    this.jackContainer = jack

    this.clearArrow()
  }
}
const Layer = {
  prototype: {
    /* 隱藏原來的腳註 */
    hideSourceFoonote() {
      $(this.footnoteParent).css({display: 'none'})
    },
    getFootnoteRefParent(className = 'footnote-ref') {
      return $(`.${className}`, this.refParent)
    },
    getFootnoteRef() {
      return $(`.footnote-ref > a[href^="#fn"]`, this.refParent)
    },
    getFootnote(ref) {
      const href = ref.getAttribute('href')
      return $$(`${href}.footnote-item`, this.footnoteParent)
    },
    splits: [],

    collectLine () {
      const {splits} = this
      const lines = []

      for (let i = 0; i < splits.length; ++i) {
        const current_line = this.getCurrentLineAnocher(splits[i])

        i = splits.indexOf(current_line[current_line.length - 1])

        lines.push(current_line)
      }

      return lines
    },

    'resizeAdjust' () {
      const lines = this.collectLine()

      lines.forEach(line => {
        const filted = line.filter(sp => {
          if (sp.status) {
            return true
          } else {
            if (sp.normal_status) {
              sp.layerAdjustOffset()
              // sp.layerAdjustHeight()
            }
            return false
          }
        })

        filted.forEach(async (split, cursor) => {
          const splitParentPage = elementIsHidden(split.supContainer)
          let tempStyle = {
            opacity: 0,
            position: 'fixed',
            top: '100vh',
            left: '0',
          }
          if (splitParentPage) {
            $(splitParentPage).css(tempStyle)
            $(splitParentPage).css('display', '')

            await waitting(1000 / 60)
          }

          const anotherLineAnocher = this.getCurrentLineAnocher(split).filter(sp => (sp !== split) && (sp.status))

          if (split.hasInitial() && split.canUseInitialSplitLayer()) {
            if (split.normal_status && anotherLineAnocher.length && cursor) {
              split.status = false
              await split.normalSlideUp()
            } else if (split.normal_status && !anotherLineAnocher.length) {
              await split.normalSlideUp()
              await split.initialSlideDown()
            } else {
              split.layerAdjustOffset()
              await split.initialSlideUp()
              await split.initialSlideDown()
            }
          } else if (split.initial_status) {
            // split.initialLayerAdjust()

            if (anotherLineAnocher.length && (cursor === 0)) {
              split.status = false
              await split.initialSlideUp()
              // split.normalSlideUp()
            } else {
              await split.initialSlideUp()
              await split.normalSlideDown()
            }
          } else {
            if (anotherLineAnocher.length && cursor) {
              await split.slideUp()
            } else {
              split.layerAdjustOffset()
              await split.normalSlideUp()
              await split.normalSlideDown()
            }
          }

          if (splitParentPage) {
            $(splitParentPage).css('display', 'none')

            await waitting(1000 / 60)

            $(splitParentPage).removeCss(...Object.keys(tempStyle))
          }

        })

      })
    },

    'setResize' () {
      this.splits.forEach(split => {
        split.layerAdjustOffset()
      })

      const off_width = () => document.body.offsetWidth
      let lastWidth = off_width()
      const resizeHandle = async e => {
        if (lastWidth !== off_width()) {
          this.resizeAdjust()
        }
        lastWidth = off_width()
      }
      window.addEventListener('resize', resizeHandle)
      resizeHandle()
    },

    getCurrentLineAnocher (split) {
      const offset = this.splits.indexOf(split)
      if (offset !== -1) {
        const current_offsetTop = split.supContainer.offsetTop
        return this.splits.filter(c_split => {

          return (current_offsetTop === c_split.supContainer.offsetTop)
        })
      } else {
        console.warn('找不到目标 split', split, this)
        return []
      }
    },

    insertSplitElement() {
      const {self} = this
      this.getFootnoteRef().forEach(ref => {
        const footnoteElement = this.getFootnote(ref)
        const split = new Split(this, ref, footnoteElement.innerHTML)
        this.splits.push(split)
        split.on('slide-down', async () => {
          const current_offsetTop = split.supContainer.offsetTop

          for (let i = 0; i < this.splits.length; ++i) {
            if (
              this.splits[i].status &&
              this.splits[i] !== split &&
              current_offsetTop === this.splits[i].supContainer.offsetTop
            ) {
              await this.splits[i].slideUp()
            }
          }
        })
        split.on('resize', current_split => {
          if (current_split.hasInitial() && current_split.canUseInitialSplitLayer()) {
            const lineAnocher_list = this.getCurrentLineAnocher(current_split)
            lineAnocher_list.shift()
            lineAnocher_list.forEach(sp => {
              sp.initial_status && sp.slideUp()
            })
          }
        })

        ref.onclick = e => {
          e.preventDefault()
          e.stopPropagation()
          split[split.status ? 'slideUp' : 'slideDown']()
          return false
        }
      })
    },
    init() {
      if (!this.footnoteParent) {
        console.info('不啟用優秀的功能，文章中似乎沒有可用腳註')
      } else {
        this.hideSourceFoonote()
        this.insertSplitElement()

        this.setResize()
      }
    },
  },
  init(refParent, footnoteParent) {
    const instance = Object.create(this.prototype)

    // 清除 .page 元素尾部的 .footnotes-sep
    $('.footnotes-sep').remove()
    instance.self = this
    instance.refParent = refParent
    instance.footnoteParent = footnoteParent
    instance.init()
    return instance
  },
}

// layer 優秀的功能
pa_init(async () => {

})
