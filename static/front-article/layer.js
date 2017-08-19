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

    const speed = 0.35
    const contentEle = this.getSplitContentElement()
    const {scrollHeight} = contentEle
    const {parentNode} = this.jackContainer
    const parentLineHeight = getComputedStyle(parentNode).lineHeight
    const refParent = this.refContainer.parentNode
    const refParentLineHeight = getComputedStyle(refParent).lineHeight

    this.jackTransitionDuration = (scrollHeight + parseFloat(parentLineHeight)) / speed
    $([this.jackContainer, this.splitContainer]).css({
      transitionDuration: `${this.jackTransitionDuration}ms`,
    })

    await waitting(1000 / 60)

    $(this.jackContainer).css({
      height: `${scrollHeight + parseFloat(parentLineHeight)}px`,
    })

    // await waitting(parseFloat(parentLineHeight) / speed)
    this.splitTransitionDuration = scrollHeight / speed
    let splitContainerTop;

    splitContainerTop = this.jackContainer.offsetTop

    $(this.splitContainer).css({
      height: `${scrollHeight}px`,
      top: `${splitContainerTop}px`,
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
    $(this.jackContainer).css('height', `1.8em`)

    await waitting(this.jackTransitionDuration)
    $(this.jackContainer).css('display', 'none').classRemove('slidedowned')
    $(this.splitContainer).classRemove('slidedowned')
    $('.split-content', this.splitContainer).css('display', 'none')
    await waitting(1000 / 30)
  }
  constructor(ref, html) {
    const splitEle = this.createSplitElement(html)

    const jack = document.createElement('div')
    $(jack).class('jack')

    ref.parentNode.parentNode.insertBefore(splitEle, ref.parentNode)
    // splitEle.parentNode.insertBefore(jack, splitEle)
    ref.parentNode.parentNode.insertBefore(jack, ref.parentNode.nextSibling)
    $(splitEle.parentNode).css('position', 'relative')

    this.splitContainer = splitEle
    this.refContainer = ref
    this.jackContainer = jack

    this.setResize()

    this.clearArrow()
  }
  setResize() {
    const off_width = () => document.body.offsetWidth
    let lastWidth = off_width()
    const lthis = this
    const resizeHandle = async function(e) {
      if (lastWidth === off_width()) {
        return
      } else if (lthis.status) {
        await lthis.slideUp()
        lthis.slideDown()
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

        let status = false
        ref.onclick = e => {
          e.preventDefault()
          split[status ? 'slideUp' : 'slideDown']()
          status = !status
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
  try {
    window.layer = Layer.init($$('#article'), $$('#article section.footnotes'))
  } catch (e) {
    $(document.body).css('color', '#CB1B45').text(`【${e.name}】${e.message}
      ${e.stack}`)
  }
})
