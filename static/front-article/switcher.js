class Switcher {
  pause() { this.isPause = true }
  resume() { this.isPause = false }
  constructor(page, previous, next) {
    if (!page) throw new Error('no page')
    else if (!previous) throw new Error('no previous')
    else if (!next) throw new Error('no next')

    this.page = page
    this.previous = previous
    this.next = next

    previous.addEventListener('click', e => {
      if (!this.isPause) {
        this.emit('previous-click')
        --page.pageCode
        this.emit('click', 'previous', previous)
      }
    })
    next.addEventListener('click', e => {
      if (!this.isPause) {
        this.emit('next-click')
        ++page.pageCode
        this.emit('click', 'next', next)
      }
    })

    const pageChangeHandle = pageCode => {
      // next previous 的外部 CSS 的 visibility 為 hidden
      const arr = $([next, previous]).css('visibility', '')

      // 最後一頁
      if (pageCode >= (page.pages.length - 1)) {
        arr.shift()
      }
      // 第一頁
      if (pageCode === 0) {
        arr.pop()
      }

      arr.css('visibility', 'visible')
    }
    page.on('change', pageChangeHandle)
    pageChangeHandle(page.pageCode)
  }
}
Switcher.prototype.__proto__ = Object.create(EventLite)
