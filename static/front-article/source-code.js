function getElementPageY(element, root = document.body) {
  let totalOffsetTop = 0
  let ele = element

  while (ele !== root) {
    totalOffsetTop += ele.offsetTop
    ele = ele.parentNode
  }

  return totalOffsetTop
}
function ArrayForEach(arr, cb) {
  const LEN = arr.length
  for (let cursor = 0; cursor < LEN; ++cursor)
    cb(arr[cursor], cursor, arr)
}
function textAreaSelect(ele, start, end) {
  if (document.selection) {
    const range = ele.createTextRange()
    range.moveEnd('character', -ele.value.length)
    range.moveEnd('character', end)
    range.moveStart('character', start)
    range.select()
  } else {
    ele.focus()
    ele.setSelectionRange(start, end)
  }
}
const copy2clip = (() => {
  const ele = document.createElement('button')
  // document.body.appendChild(ele)

  return function (str) {
    const clip = new Clipboard(ele, { text() { return str } })
    ele.click()
  }
})()

function ArrayEachByRange(arr, start, end, callback, direct) {
  if (direct) {
    for (let cursor = end - 1; cursor >= start; --cursor) {
      callback(arr[cursor], cursor)
    }
  } else {
    for (let cursor = start; cursor < end; ++cursor) {
      callback(arr[cursor], cursor)
    }
  }
}

function copyEffect(code_list, line_list, start, end, slideDirect) {
  let direct
  if (slideDirect === 1) {
     direct = true
  } else {
    direct = false
  }
  let time_times = 0
  ArrayEachByRange(code_list, start, end, (code, cursor) => {
    const line = line_list[cursor]
    const {style} = line
    setTimeout(() => {
      // style.backgroundColor = 'rgba(48, 103, 133, 0.05)'
      style.backgroundColor = ''
      code.classList.remove('selected')
    }, time_times * 32)

    ++time_times
  }, direct)
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
      })

      $('code > .inline', this.container).forEach(inlineEle => {
        inlineEle.style.minWidth = `${maxWidth}px`
      })

      $('code > .copy', this.container).forEach(copy_button => {
        copy_button.style.minWidth = `${maxWidth}px`
      })
    }
    window.addEventListener('resize', resizeHandle)
    resizeHandle()
  }
  getSelectedLine() {
    const selected_list = []
    const line_list = $('.inline', this.container)
    $('.codeline-frame > .linecode', this.container).map((codeLine_ele, lineCursor) => {
      if (codeLine_ele.className.indexOf('selected') !== -1) {
        selected_list.push(line_list[lineCursor])
      }
    })
    return selected_list.map(selected_ele => $(selected_ele).text()).join('\n')
  }
  constructor(container) {
    this.container = container

    const sourceCodeContainer_list = $('.source-code', this.container)
    sourceCodeContainer_list.forEach((sourceCodeContainer, cursor) => {
      const lineCode_list = $('.codeline-frame > .linecode', sourceCodeContainer)
      const codelines = $('code > .inline', sourceCodeContainer)

      let ScrollInterval = 3
      let scrollDirect = 0
      let scrollContext = null
      setInterval(() => {
        if (!scrollContext) { return }
        else if (scrollDirect === 0) { return }
        else if (scrollDirect < 0) {
          var setScrollInterval = ScrollInterval
          document.body.scrollTop += setScrollInterval
          const {clientY, pageY} = scrollContext
          touchMiddle({
            clientY,
            pageY: pageY + setScrollInterval,
          })
        } else if (scrollDirect > 0) {
          var setScrollInterval = -ScrollInterval
          document.body.scrollTop += setScrollInterval
          const {clientY, pageY} = scrollContext
          touchMiddle({
            clientY,
            pageY: pageY + setScrollInterval,
          })
        }
      }, 17)

      let slideDirect = 0
      let firstLineCodeIndex = null
      let lastLineCode = null
      let lastLineCodeIndex = -1
      let modelStart = null
      let modelEnd = 0
      function touchMiddle(tap_point) {
        const {clientY, pageY} = tap_point

        ArrayForEach(lineCode_list, (lineCodeEle, cursor) => {

          const linePageY = getElementPageY(lineCodeEle)
          if ((pageY >= linePageY) && (pageY < (linePageY + lineCodeEle.offsetHeight))) {
            if (lastLineCode === lineCodeEle) {
              return
            } else {
              lastLineCode = lineCodeEle

              if (cursor > firstLineCodeIndex) {
                slideDirect = -1
              } else {
                slideDirect = 1
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

          const lineStyle = codelines[cursor].style
          if ((cursor >= modelStart) && (cursor < modelEnd)) {
            if (lineCodeEle.className.indexOf('selected') === -1) {
              lineCodeEle.classList.add('selected')
            }
            if (!lineStyle.backgroundColor.length) {
              lineStyle.backgroundColor = 'rgba(48, 103, 133, 0.2)'
            }
          } else {
            if (lineCodeEle.className.indexOf('selected') !== -1) {
              lineCodeEle.classList.remove('selected')
            }
            if (lineStyle.backgroundColor.length) {
              lineStyle.backgroundColor = ''
            }
          }
        })

        if (clientY < 48) {
          // 手指在上邊緣
          scrollContext = tap_point
          scrollDirect = 1
        } else if (clientY > window.innerHeight - 48) {
          //~下邊緣
          scrollContext = tap_point
          scrollDirect = -1
        } else {
          scrollContext = null
        }
      }

      const codelineFrame = $$('.codeline-frame', sourceCodeContainer)
      let isTouch = false
      let touchMoved = false
      let touchEnded = false
      let touchTargetIsSelected = false
      codelineFrame.addEventListener('touchstart', e => {
        isTouch = true
        e.preventDefault()

        // 觸摸開始，清除掉所有的 selected
        ArrayForEach(lineCode_list, lineCodeEle => {
          lineCodeEle.classList.remove('selected')
        })

        touchMiddle(e.touches[0])
        console.info('touchstart', e)
      })

      let mouseIsDown = false
      codelineFrame.addEventListener('mousedown', e => {
        mouseIsDown = true
        e.preventDefault()

        // 觸摸開始，清除掉所有的 selected
        lineCode_list.forEach(lineCodeEle => {
          lineCodeEle.classList.remove('selected')
        })

        touchMiddle({
          pageY: e.pageY,
          clientY: e.clientY,
        })
      })

      codelineFrame.addEventListener('touchmove', e => {
        e.preventDefault()
        touchMoved = true
        touchMiddle(e.touches[0])
      })
      document.body.addEventListener('mousemove', e => {
        if (!mouseIsDown) { return }
        e.preventDefault()
        touchMiddle({
          pageY: e.pageY,
          clientY: e.clientY,
        })
      })

      const lastModel = {}
      const end_handle = e => {
        e.preventDefault()
        ObjectAssign(lastModel, {
          scrollDirect,
          scrollContext,
          firstLineCodeIndex,
          modelStart,
          modelEnd,
          slideDirect,
        })

        touchEnded = true
        scrollDirect = 0
        scrollContext = null

        // console.info('start:', lineCode_list[modelStart].offsetTop)
        // console.info('end:', lineCode_list[modelEnd].offsetTop)
        console.warn(lastModel)
        const top = lineCode_list[modelStart].offsetTop
        const height = lineCode_list[modelEnd - 1].offsetTop + lineCode_list[modelEnd - 1].offsetHeight - top
        positingCopyButton(top, height)

        firstLineCodeIndex = null
        lastLineCode = null
        lastLineCodeIndex = -1

        modelStart = null
        modelEnd = 0
        console.warn('touchend', e)
        console.info(this.getSelectedLine())
      }
      codelineFrame.addEventListener('touchend', end_handle)
      document.body.addEventListener('mouseup', e => {
        if (!copyWasPress && !isTouch && mouseIsDown) {
          end_handle(e)
        }
        mouseIsDown = false
      })

      const sourceCode_frame = $$('code', sourceCodeContainer)
      const copy_button = document.createElement('button')
      copy_button.classList.add('copy')
      sourceCode_frame.appendChild(copy_button)
      if (!copy_button.haveResizeHandle) {
        copy_button.haveResizeHandle = true
        window.addEventListener('resize', e => {
          const {modelStart, modelEnd} = lastModel
          console.warn(modelStart, modelEnd)
          if (Number.isInteger(modelStart)) {
            const top = lineCode_list[modelStart].offsetTop
            const height = lineCode_list[modelEnd - 1].offsetTop + lineCode_list[modelEnd - 1].offsetHeight - top
            positingCopyButton(top, height)
          } else {
            return
          }
        })
      }
      let copyWasPress = false
      copy_button.onmousedown = e => { copyWasPress = true }
      copy_button.onclick = e => {
        copyWasPress = false
        console.warn(lastModel.modelStart)
        const {modelStart, modelEnd, slideDirect} = lastModel
        copyEffect(lineCode_list, codelines, modelStart, modelEnd, slideDirect)
        copy2clip(this.getSelectedLine())
      }
      const positingCopyButton = (top, height) => {
        $(copy_button).css({
          top: `${parseFloat(top)}px`,
          height: `${parseFloat(height)}px`,
        })
      }
    })

    this.setSize()
  }
}
