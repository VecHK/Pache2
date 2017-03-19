(function () {
  const fillChar = function (str, length, fill_char = ' ') {
    str = str.toString()
    if (str.length < length)
      return fillChar(fill_char + str, length, fill_char)
    else
      return str
  }

  const Cutl = {
    prototype: {
      _FormatRGBColorNumber(num) {
        if (typeof(num) !== 'number')
          num = 0
        else if (!Number.isInteger(num) || (num < 0) || (num > 255))
          throw new Error('非法RGB數值（色值小與0、大於0或者不是一個合法的整數）')

        return num
      },
      setRGB(r, g, b) {
        this.r = this._FormatRGBColorNumber(r)
        this.g = this._FormatRGBColorNumber(g)
        this.b = this._FormatRGBColorNumber(b)
      },
      toRGBArray() {
        return [this.r, this.g, this.b]
      },
      toString() { return this.toColorCode() },
      getColorCode() {
        const color_code = this.toRGBArray().map(cc => {
          return fillChar(cc.toString(16), 2, '0')
        }).join('')

        return '#' + color_code
      },
      // 灰度處理
      // 灰度的計算公式是 Gray = 0.299R + 0.587G + 0.144B
      // 計算出的數值 Gray 需要四捨五入
      toGray() {
        let gray = (0.299 * this.r) + (0.587 * this.g) + (0.114 * this.b)
        let g = Math.round(gray)
        return this.parent.init(g, g, g)
      },
    },

    // 色值 OR 位運算
    or(c1, c2) {
      return this.init(c1.r | c2.r, c1.g | c2.g, c1.b | c2.b)
    },

    // 求兩色值平均值， 公式是：
    // 融合色 => (原色1 + 原色2) / 2
    // 返回的都應該是 Cutl 實例
    average(c1, c2) {
      return this.init(
        (c1.r + c2.r) / 2,
        (c1.g + c2.g) / 2,
        (c1.b + c2.b) / 2
      )
    },

    _cc2ArrProcessing(ch){
      let num = parseInt(ch, 16)
      if (!Number.isInteger(num)) throw new Error(`非法顏色代碼（${str}）`)
      return num
    },
    // 顏色代碼轉顏色數組
    cc2Arr(str) {
      let arr = [str[0] + str[1], str[2] + str[3], str[4] + str[5]]
      return arr.map(this._cc2ArrProcessing)
    },
    colorArgument(color_code) {
      color_code = color_code.toString().trim()

      // 去掉開頭的「#」
      if (color_code[0] === '#') {
        color_code = color_code.replace('#', '')
      }
      // 「XXX」這樣的要轉成「XXXXXX」
      if (color_code.length === 3) {
        const c = color_code
        color_code = `${c[0] + c[0]}${c[1] + c[1]}${c[2] + c[2]}`
      }
      // 如果不是六位數的顏色代碼，則拋出一個錯誤
      if (color_code.length !== 6) {
        throw new Error('非法顏色代碼（字符串長度是不是有問題）')
      }

      return this.cc2Arr(color_code)
    },
    init(r, g, b) {
      if (arguments.length === 1) {
        const color_arr = this.colorArgument(r)
        return this.init(...color_arr)
      }

      const instance = Object.create(this.prototype)
      instance.parent = this
      instance.setRGB(r, g, b)
      return instance
    },
  }

  try {
    module.exports = Cutl
  } catch (e) {
    window.Cutl = Cutl
  }
})()
