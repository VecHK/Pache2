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

      this.resizeCopyButton()
    }
    window.addEventListener('resize', resizeHandle)
    resizeHandle()
  }

  'resizeCopyButton' (pre_modelStart) {
    if (this.lastModel) {
      const {lineCode_list} = this
      let {modelStart, modelEnd} = this.lastModel
      if (pre_modelStart !== undefined) {
        modelStart = pre_modelStart
      }
      if (modelStart !== undefined) {
        const top = lineCode_list[modelStart].offsetTop
        return this.copyButton.positing(top)
      }
    }
  }
  'slideCopyButton' (ignore_change) {
    const {copyButton, lastRuntime, runtime} = this
    const {firstLineCodeIndex, modelStart, modelEnd} = runtime

    const 有变动 = (modelStart !== lastRuntime.modelStart) || (modelEnd !== lastRuntime.modelEnd)
    if (copyButton.status && (有变动 || ignore_change)) {
      // console.log(runtime)
      if (firstLineCodeIndex > modelStart) {
        return this.resizeCopyButton(modelStart)
      } else {
        return this.resizeCopyButton(modelEnd)
      }
    }
  }


  getSelectedLine() {
    const selected_list = []
    const code_list = $('.codeline-frame > .linecode', this.container)
    const line_list = $('.inline', this.container)

    return line_list.filter((line_ele, lineCursor) => {
      return code_list[lineCursor].className.indexOf('selected') !== -1
    }).map(selected_ele => {
      return fetchElementText(selected_ele)
    }).join('\n')
  }
  constructor(container) {
    this.container = container

    // const sourceCodeContainer_list = $('.source-code', this.container)
    this.sourceCodeContainer = container
    const {sourceCodeContainer} = this

    this.copyButton = new SourceCodeCopyButton(sourceCodeContainer)

    this.lineSelector = new LineSelector(sourceCodeContainer)
    const lineCode_list = $('.codeline-frame > .linecode', sourceCodeContainer)
    this.lineCode_list = lineCode_list

    const codelines = $('code > .inline', sourceCodeContainer)

    let ScrollInterval = 3
    let scrollDirect = 0
    let scrollContext = null
    let scrollingElement = getScrollingElement()
    // 定時判斷
    setInterval(() => {
      if (!scrollContext) { return }
      else if (scrollDirect === 0) { return }
      else if (scrollDirect < 0) {
        var setScrollInterval = ScrollInterval
        scrollingElement.scrollTop += setScrollInterval
        const {clientY, pageY} = scrollContext
        touchMiddle({
          clientY,
          pageY: pageY + setScrollInterval,
        })
      } else if (scrollDirect > 0) {
        var setScrollInterval = -ScrollInterval
        scrollingElement.scrollTop += setScrollInterval
        const {clientY, pageY} = scrollContext
        touchMiddle({
          clientY,
          pageY: pageY + setScrollInterval,
        })
      }
    }, 17)

    const 边缘范围 = 48

    let slideDirect = 0
    let firstLineCodeIndex = null
    let lastLineCode = null
    let lastLineCodeIndex = -1
    let modelStart = null
    let modelEnd = 0

    this.lastRuntime = {}
    this.runtime = {}
    const {lastRuntime, runtime} = this

    const touchMiddle = tap_point => {
      ObjectAssign(lastRuntime, runtime)

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
          this.lineSelector.select(codelines[cursor])
        } else {
          this.lineSelector.unselect(codelines[cursor])
        }
        ObjectAssign(runtime, {
          scrollDirect,
          scrollContext,
          firstLineCodeIndex,
          modelStart,
          modelEnd,
          slideDirect,
        })
      })

      if (clientY < 边缘范围) {
        // 手指在上邊緣
        scrollContext = tap_point
        scrollDirect = 1
      } else if (clientY > window.innerHeight - 边缘范围) {
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
    document.body.addEventListener('touchstart', () => {
      isTouch = true
    }, true)

    codelineFrame.addEventListener('touchstart', e => {
      e.preventDefault()

      this.lineSelector.unselectAll()

      touchMiddle(e.touches[0])
      console.info('touchstart', e)
    })

    let mouseIsDown = false
    codelineFrame.addEventListener('mousedown', e => {
      mouseIsDown = true

      e.preventDefault()

      // 觸摸開始，清除掉所有的 selected
      this.lineSelector.unselectAll()
      // this.copyButton.hide()

      touchMiddle({
        pageY: e.pageY,
        clientY: e.clientY,
      })

      setTimeout(() => {
        if (mouseIsDown && this.copyButton.status) {
          this.copyButton.setLeft()
          this.copyButton.positing()

          waitting(182).then(res => {
            isTouch || this.slideCopyButton(true)
          })
        }
      }, 200)
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

      isTouch || this.slideCopyButton()
    })

    const lastModel = {}
    this.lastModel = lastModel
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
      console.log(firstLineCodeIndex, modelStart, modelEnd)

      this.copyButton.clearLeft()

      if (firstLineCodeIndex > modelStart) {
        isTouch || this.resizeCopyButton(modelStart)
      } else {
        isTouch || this.resizeCopyButton(modelEnd)
      }

      firstLineCodeIndex = null
      lastLineCode = null
      lastLineCodeIndex = -1

      modelStart = null
      modelEnd = 0

      Object.keys(lastRuntime).forEach(key => {
        delete lastRuntime[key]
        delete runtime[key]
      })
      // console.warn('touchend', e)
    }
    codelineFrame.addEventListener('touchend', e => {
      end_handle(e)
      isTouch = false
    })


    document.body.addEventListener('mouseup', e => {
      if (!isTouch && mouseIsDown) {
        end_handle(e)
      }
      mouseIsDown = false
    })
    document.body.addEventListener('mouseenter', e => {
      if (mouseIsDown && e.buttons !== 1) {
        // 不是按著左鍵進入
        mouseIsDown = false
        end_handle(e)
      }
    })

    this.lineSelector.on('click-unselected', line => {
      isTouch || this.resizeCopyButton(line.__LINE_CURSOR__)
    })
    this.lineSelector.on('copy', () => {
      this.copyButton.hide()
    })
    this.copyButton.on('click', () => {
      this.lineSelector.copy()
      this.copyButton.hide()
    })

    this.setSize()
  }
}

class SourceCodeFrame {
  constructor(container) {
    this.list = $('.source-code', container).map(sourceCodeEle => {
      return new SourceCode(sourceCodeEle)
    })
  }
}
