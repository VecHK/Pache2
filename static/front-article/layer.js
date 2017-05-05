class Split {
  createSplitElement(footnoteContent) {
    const ele = document.createElement('div')
    $(ele).class('split')

    const contentEle = document.createElement('div')
    $(contentEle).class('split-content').html(footnoteContent)
    $(ele).append(contentEle)

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

    const contentEle = this.getSplitContentElement()
    const {scrollHeight} = contentEle
    const {parentNode} = this.jackContainer
    const parentLineHeight = getComputedStyle(parentNode).lineHeight
    const refParent = this.refContainer.parentNode
    const refParentLineHeight = getComputedStyle(refParent).lineHeight

    $(this.jackContainer).css({
      height: `${scrollHeight + parseFloat(parentLineHeight)}px`,
      // height: `calc(${scrollHeight}px + ${parentLineHeight})`,
    })

    await waitting(50)

    $(this.splitContainer).css({
      height: `${scrollHeight}px`,
      // height: `calc(${scrollHeight}px)`,
      top: `calc(${refParent.offsetTop}px + ${this.refContainer.offsetHeight * 1.5}px)`,
    })

    await waitting(618)

    $(this.jackContainer).class('slidedowned')
    $(this.splitContainer).class('slidedowned')
  }
  async slideUp() {
    this.status = false
    $(this.splitContainer).css({
      height: `0px`,
    })
    await waitting(100)
    $(this.jackContainer).css('height', `0px`)

    await waitting(618)
    $(this.jackContainer).css('display', 'none')
    $(this.splitContainer).css('display', 'none')
    $(this.jackContainer).classRemove('slidedowned')
    $(this.splitContainer).classRemove('slidedowned')
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
    insertSplitElement() {
      const {self} = this
      this.getFootnoteRef().forEach(ref => {
        const footnoteElement = this.getFootnote(ref)
        const split = new Split(ref, footnoteElement.innerHTML)

        let status = false
        ref.onclick = e => {
          e.preventDefault()
          split[status ? 'slideUp' : 'slideDown']()
          status = !status
          return false
        }

        let lastWidth = document.body.offsetWidth
        window.addEventListener('resize', async e => {
          if (lastWidth === document.body.offsetWidth) {
            return
          } else if (split.status) {
            await split.slideUp()
            split.slideDown()
          }
          lastWidth = document.body.offsetWidth
        })
      })
    },
    init() {
      this.hideSourceFoonote()
      this.insertSplitElement()
    },
  },
  init(refParent, footnoteParent = refParent) {
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
