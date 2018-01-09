/*
  优秀的功能
  不使用 EventLite ，换成 async-call，因为需要异步事件机制
 */

class Split {
  clearArrow() {
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
  async slideDown() {
    this.status = true

    await this.emit('slide-down')

    $('.split-content', this.splitContainer).css('display', '')
    $(this.splitContainer).css('display', '')
    $(this.jackContainer).css('display', '')
    // await waitting(1000 / 30)

    $(this.splitContainer).css({
      width: `${document.body.offsetWidth}px`,
      left: `-${this.splitContainer.parentNode.offsetLeft}px`,
    })
    if (document.body.offsetWidth >= 800) {
      $(this.contentContainer).css({
        padding: `0em ${document.body.offsetWidth/2 - 760/2}px`
      })
    } else {
      $(this.contentContainer).removeCss('padding')
    }

    const speed = 0.25
    const contentEle = this.getSplitContentElement()
    const {scrollHeight} = contentEle
    const {parentNode} = this.jackContainer
    const parentLineHeight = getComputedStyle(parentNode).lineHeight
    const jackParentLineHeight = getComputedStyle(this.jackContainer.parentNode)['line-height']
    console.warn(parentLineHeight, jackParentLineHeight)
    const refParent = this.refContainer.parentNode
    const refParentLineHeight = getComputedStyle(refParent).lineHeight

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
  async slideUp() {
    this.status = false
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
  constructor(ref, html) {
    AsyncCall.mixin(this)

    const splitEle = this.createSplitElement(html)

    const jack = document.createElement('div')
    $(jack).class('jack')

    // ref.parentNode.parentNode.insertBefore(splitEle, ref.parentNode)
    $(ref.parentNode).append(splitEle)
    // splitEle.parentNode.insertBefore(jack, splitEle)

    /* 锚后面如果是标点符号（Han 的 h-char 元素表示），则加到 ref 中 */
    const nextSibling = ref.parentNode.nextSibling
    if (nextSibling && (nextSibling.tagName.toLowerCase() === 'h-char')) {
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

    this.setResize()

    this.clearArrow()
  }
  setResize() {
    function roundFun(value, n) {
      return Math.round(value*Math.pow(10,n))/Math.pow(10,n);
    }
    const setOffset = () => {
      const jackParentLineHeight = parseFloat(getComputedStyle(this.jackContainer.parentNode)['line-height'])
      const supContainerHeight = this.supContainer.offsetHeight
      // console.warn()
      const diff = (jackParentLineHeight - supContainerHeight) / 2
      $(this.splitContainer).css('transform', `translateY(${roundFun(jackParentLineHeight - diff / 2, 1)}px)`)
      $(this.jackContainer).css('height', `${parseFloat(jackParentLineHeight - diff)}px`)
    }
    setOffset()

    const off_width = () => document.body.offsetWidth
    let lastWidth = off_width()
    const resizeHandle = async e => {
      if (lastWidth === off_width()) {
        return
      } else if (this.status) {
        setOffset()
        await this.slideUp()
        this.slideDown()
      }
      lastWidth = off_width()
    }
    window.addEventListener('resize', resizeHandle)
    resizeHandle()
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
    insertSplitElement() {
      const {self} = this
      this.getFootnoteRef().forEach(ref => {
        const footnoteElement = this.getFootnote(ref)
        const split = new Split(ref, footnoteElement.innerHTML)
        this.splits.push(split)
        split.on('slide-down', async () => {
          const current_offsetTop = split.supContainer.offsetTop

          for (let i = 0; i < this.splits.length; ++i) {
            if (
              this.splits[i] !== split &&
              current_offsetTop === this.splits[i].supContainer.offsetTop
            ) {
              await this.splits[i].slideUp()
            }
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
