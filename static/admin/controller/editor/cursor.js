define(function () {
  class Cursor {
    /**
    * 設置光標位置
    * @param offset 文本偏移量
    @ @return this.select(offset, offset)
    */
    setCursor(offset) {
      return this.select(offset, offset)
    }
    /**
    * 選中文字
    * @param start 開始的偏移量
    * @param end 結束的偏移量
    * @return this
    */
    select(start, end) {
      if (document.selection) {
        const range = this.container.createTextRange()
        range.moveEnd('character', -this.container.value.length)
        range.moveEnd('character', end)
        range.moveStart('character', start)
        range.select()
      } else {
        this.container.setSelectionRange(start, end)
        this.container.focus()
      }

      return this
    }

    /**
     * 在當前光標插入字符串
     * @param str
     * @return this
     */
    insert(str, cursor) {
      if (cursor) {
        this.setCursor(cursor)
      }

      let ele = this.container
      let {value} = this.container
      if (document.selection) {
        ele.focus()
        document.selection.createRange().text = str
      } else {
        let cp = ele.selectionStart
        let ubbLength = ele.value.length
        let s = ele.scrollTop

        ele.value =
          ele.value.slice(0, ele.selectionStart) +
          str +
          ele.value.slice(ele.selectionStart, ubbLength)

        console.warn(str, str.length)

        this.setCursor(cp + str.length)

        let firefox = navigator.userAgent.toLowerCase().match(/firefox\/([\d\.]+)/) && setTimeout(function(){
            if(ele.scrollTop != s) ele.scrollTop = s
        },0)
      }

      return this
    }

    removeRangeRaw(str, start, end) {
      return str.slice(0, start) + str.slice(end, str.length)
    }
    /**
     * 刪除指定段的文本
     * @param start 刪除起始的文本偏移量
     * @param start 刪除結束的文本偏移量
     * @return this
     */
    removeRange(start, end) {
      this.container.value = this.removeRangeRaw(this.container.value, start, end)
      return this
    }
    removeBefore() {

    }
    removeAfter() {}

    replace(con, reptext) {
      this.container.value = this.container.value.replace(con, reptext)
      return this
    }

    _throw() { throw (new Error(...arguments)) }
    constructor(container = this._throw('沒有指定容器')) {
      this.container = container
    }
  }

  return Cursor
})
