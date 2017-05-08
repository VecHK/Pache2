// 頂部的上一頁下一頁的按鈕
function switchPage() {
  const previous = $$('.top.page-btn-panel .previous')
  const next = $$('.top.page-btn-panel .next')


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

  previous.addEventListener('click', e => {
    --page.pageCode
  })
  next.addEventListener('click', e => {
    ++page.pageCode
  })
}
