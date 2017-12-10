class LineSelectorConstructor {
  /**
    container Element, their className is '.source-code'
    and HTML Tag is 'pre'(<pre>)
    @param Container Element
  */
  constructor(container) {
    this.container = container
    this._initLines()
    this._initLineNumber()
    this._initSelected()
  }
}
EventLite.create(LineSelectorConstructor.prototype)

class LineSelectorInit extends LineSelectorConstructor {
  _initLines() {
    this.linesContainer = $$('code', this.container)
    this.lines = $('.inline', this.linesContainer)
    ArrayForEach(this.lines, (line, cursor) => {
      line.__LINE_CURSOR__ = cursor
      line.addEventListener('click', e => {
        if (line.__isSelected__) {
          this.emit('click-selected', line)
        } else {
          this.emit('click-unselected', line)
          this.select(line)
        }
      })
    })
  }
  _initLineNumber() {
    this.numberContainer = $$('.codeline-frame', this.container)
    this.number = $('.linecode', this.numberContainer)
  }
  _initSelected() {
    this.selected = []
  }
}
class LineSelectorEffect extends LineSelectorInit {
  getByIndex(index) {
    return {
      line: this.lines[index],
      number: this.number[index],
    }
  }
  selectEffect(index) {
    const {line, number} = this.getByIndex(index)

    // const number = this.number[index]
    if (number.className.indexOf('selected') === -1) {
      number.classList.add('selected')
    }

    const lineStyle = line.style
    if (!lineStyle.backgroundColor.length) {
      lineStyle.backgroundColor = 'rgba(48, 103, 133, 0.2)'
    }
  }
  unselectEffect(index) {
    const {line, number} = this.getByIndex(index)

    if (number.className.indexOf('selected') !== -1) {
      number.classList.remove('selected')
    }

    const lineStyle = line.style
    if (lineStyle.backgroundColor.length) {
      lineStyle.backgroundColor = ''
    }
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
class LineSelectorCopy extends LineSelectorEffect {
  copyEffect(diffusion_point = 0) {
    const {line, selected} = this
    // this.selected = []

    let above = diffusion_point - 1
    let below = diffusion_point + 1

    this.unselectEffect(selected[diffusion_point].__LINE_CURSOR__)

    let total_times = 0
    const unit_timeout = 32

    if (above >= 0) {
      let time_times = 0
      for (let cursor = above; cursor >= 0; --cursor) {
        setTimeout(cursor => {
          this.unselectEffect(selected[cursor].__LINE_CURSOR__)
          // this.unselect(selected[cursor])
        }, time_times * 32, cursor)
        ++time_times
      }
      total_times += time_times * unit_timeout
    }

    if (below < selected.length) {
      let time_times = 0
      for (let cursor = below; cursor < selected.length; ++cursor) {
        setTimeout(cursor => {
          this.unselectEffect(selected[cursor].__LINE_CURSOR__)
          // this.unselect(selected[cursor])
        }, time_times * unit_timeout, cursor)
        ++time_times
      }
      total_times += time_times * unit_timeout
    }

    setTimeout(() => this.unselectAll(), total_times)
  }
  getSelectedText() {
    let text = ''
    const LEN = this.selected.length
    for (let cursor = 0; cursor < LEN; ++cursor) {
      text += fetchElementText(this.selected[cursor]) + '\n'
    }
    return text
  }
  'copy' (diffusion_point) {
    const text = this.getSelectedText()
    copy2clip(text)
    this.copyEffect(diffusion_point)

    this.emit('copy', text)

    return text
  }
}

class LineSelector extends LineSelectorCopy {
  selectedIndexOf(line) {
    return this.selected.indexOf(line)
  }
  isExist(line) {
    return this.selectedIndexOf(line) !== -1
  }

  select(line) {
    if (this.isExist(line)) {
      return -1
    } else {
      line.__isSelected__ = true
      const selectedIndex = this.selected.push(line)
      this.selectEffect(line.__LINE_CURSOR__)

      line.__CLICK_HANDLE__ = e => {
        this.copy(selectedIndex - 1)
      }
      line.addEventListener('click', line.__CLICK_HANDLE__)
    }
  }
  unselect(line) {
    const index = this.selectedIndexOf(line)
    if (index === -1) {
      return -1
    } else {
      line.__isSelected__ = false
      this.selected.splice(index, 1)
      this.unselectEffect(line.__LINE_CURSOR__)
      line.removeEventListener('click', line.__CLICK_HANDLE__)
      line.__CLICK_HANDLE__ = null
    }
  }

  unselectAll() {
    copyArray(this.selected).forEach(line => {
      this.unselect(line)
    })
  }
}
