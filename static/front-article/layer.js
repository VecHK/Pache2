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

    $(this.splitContainer).css('display', '')
    $(this.jackContainer).css('display', '')
    await waitting(1000 / 30)

    console.warn(document.body.offsetWidth, this.splitContainer.parentNode.offsetLeft);
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
    await waitting(1000 / 10)

    const speed = 0.3
    const contentEle = this.getSplitContentElement()
    const {scrollHeight} = contentEle
    const {parentNode} = this.jackContainer
    const parentLineHeight = getComputedStyle(parentNode).lineHeight
    const refParent = this.refContainer.parentNode
    const refParentLineHeight = getComputedStyle(refParent).lineHeight

    this.jackTransitionDuration = (scrollHeight + parseFloat(parentLineHeight)) / speed
    $(this.jackContainer).css({
      transitionDuration: `${this.jackTransitionDuration}ms`,
      height: `${scrollHeight + parseFloat(parentLineHeight)}px`,
    })

    await waitting(parseFloat(parentLineHeight) / speed)
    this.splitTransitionDuration = scrollHeight / speed
    let splitContainerTop = refParent.offsetTop + this.refContainer.offsetHeight + 8
    if ($.browser.core === 'ms') {
      splitContainerTop -= 2.5
    } else if ($.browser.core === 'moz') {
      splitContainerTop += 1
    }

    $(this.splitContainer).css({
      transitionDuration: `${this.splitTransitionDuration}ms`,
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
    $(this.jackContainer).css('height', `0px`)

    await waitting(this.jackTransitionDuration)
    $(this.jackContainer).css('display', 'none').classRemove('slidedowned')
    $(this.splitContainer).css('display', 'none').classRemove('slidedowned')
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
    let lastWidth = document.body.offsetWidth
    const resizeHandle = async e => {
      if (lastWidth === document.body.offsetWidth) {
        return
      } else if (this.status) {
        await this.slideUp()
        this.slideDown()
      }
      lastWidth = document.body.offsetWidth
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
        console.info('layer: 無腳註')
      } else {
        this.hideSourceFoonote()
        this.insertSplitElement()
      }
    },
  },
  init(refParent, footnoteParent) {
    const instance = Object.create(this.prototype)
    instance.self = this
    instance.refParent = refParent
    instance.footnoteParent = footnoteParent
    instance.init()
    return instance
  },
}

// layer 優秀的功能
pa_init(async () => {
  window.layer = Layer.init($$('#article'), $$('#article section.footnotes'))
})
