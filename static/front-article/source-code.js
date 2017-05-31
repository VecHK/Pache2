function getElementPageY(element, root = document.body) {
  let totalOffsetTop = 0
  let ele = element

  while (ele !== root) {
    totalOffsetTop += ele.offsetTop
    ele = ele.parentNode
  }

  return totalOffsetTop
}
class SourceCode {
  setSize() {
    const lineCodeBox = $$('.codeline-frame > .linecode', this.container)
    const codeFrame = $$('code', this.container)

    let last_width = 0
    const resizeHandle = e => {
      if (window.innerWidth !== last_width) {
        last_width = window.innerWidth
      } else {
        return
      }

      let maxWidth = 0
      $('code > .inline', this.container).forEach(inlineEle => {
        if (inlineEle.scrollWidth > maxWidth) {
          maxWidth = inlineEle.scrollWidth
        }
        // inlineEle.style.width = `${ScrollWidth}px`
      })

      $('code > .inline', this.container).forEach(inlineEle => {
        inlineEle.style.minWidth = `${maxWidth}px`
        // inlineEle.style.height = `${lineCodeBox.offsetHeight}px`
        // inlineEle.style.lineHeight = `${lineCodeBox.offsetHeight}px`
      })
      // codeFrame.style.minWidth = `${maxWidth}px`
    }
    window.addEventListener('resize', resizeHandle)
    resizeHandle()
  }
  constructor(container) {
    this.container = container

    this.setSize()

    const sourceCodeContainer_list = $('.source-code', this.container)
    sourceCodeContainer_list.forEach((sourceCodeContainer, cursor) => {
      const lineCode_list = $('.codeline-frame > .linecode', sourceCodeContainer)
      const codelines = $('code > .inline', sourceCodeContainer)

      let ScrollInterval = 4
      let scrollDirect = 0
      let scrollContext = null
      setInterval(() => {
        if (!scrollContext) { return }
        if (scrollDirect < 0) {
          document.body.scrollTop += ScrollInterval

          const {clientY, pageY} = scrollContext.touches[0]
          touchMiddle({
            touches: [{
              clientY,
              pageY: pageY + ScrollInterval,
            }]
          })
        } else if (scrollDirect > 0) {
          document.body.scrollTop -= ScrollInterval

          const {clientY, pageY} = scrollContext.touches[0]
          touchMiddle({
            touches: [{
              clientY,
              pageY: pageY - ScrollInterval,
            }]
          })
        }
      }, 16.7)

      let firstLineCodeIndex = null
      let lastLineCode = null
      let lastLineCodeIndex = -1
      let modelStart = null
      let modelEnd = 0
      function touchMiddle(e) {
        const {clientY, pageY} = e.touches[0]

        lineCode_list.forEach((lineCodeEle, cursor) => {
          let direct = 0
          const linePageY = getElementPageY(lineCodeEle)
          if ((pageY >= linePageY) && (pageY < (linePageY + lineCodeEle.offsetHeight))) {
            if (lastLineCode === lineCodeEle) {
              return
            } else {
              lastLineCode = lineCodeEle

              if (cursor > lastLineCodeIndex) {
                direct = -1
              } else {
                direct = 1
              }

              lastLineCodeIndex = cursor
            }

            if (firstLineCodeIndex === null) firstLineCodeIndex = cursor

            if (cursor < firstLineCodeIndex) {
              // 在觸摸初始位置的上面
              modelStart = cursor
            } else if (cursor > firstLineCodeIndex) {
              // ~下面
              modelEnd = cursor + 1
            } else {
              // 同個位置
              modelStart = cursor
              modelEnd = cursor + 1
            }
          }
          if ((cursor >= modelStart) && (cursor < modelEnd)) {
            lineCodeEle.classList.add('clicked')
          } else {
            lineCodeEle.classList.remove('clicked')
          }
        })

        if (clientY < 48) {
          // 手指在上邊緣
          scrollContext = e
          scrollDirect = 1
        } else if (clientY > window.innerHeight - 48) {
          //~下邊緣
          scrollContext = e
          scrollDirect = -1
        } else {
          scrollContext = null
        }
      }

      const codelineFrame = $$('.codeline-frame', sourceCodeContainer)
      codelineFrame.addEventListener('touchstart', e => {
        e.preventDefault()

        // 觸摸開始，清除掉所有的 clicked
        lineCode_list.forEach(lineCodeEle => {
          lineCodeEle.classList.remove('clicked')
        })

        touchMiddle(e)
        console.info('touchstart', e)
      })

      codelineFrame.addEventListener('touchmove', e => {
        e.preventDefault()
        touchMiddle(e)
      })
      codelineFrame.addEventListener('touchend', e => {
        e.preventDefault()
        scrollDirect = 0
        scrollContext = null
        firstLineCodeIndex = null

        modelStart = null
        modelEnd = 0
        console.warn('touchend', e)
      })

      codelines.forEach((line, lineCursor) => {
        line.addEventListener('click', e => {
          const lineCode = lineCode_list[lineCursor]
          if (lineCode.className.indexOf('clicked') !== -1) {
            lineCode.classList.remove('clicked')
          } else {
            lineCode.classList.add('clicked')
          }
        })
      })
    })
  }
}
