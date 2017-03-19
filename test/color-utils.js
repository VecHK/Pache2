const should = require('should');
const Cutl = require('../admin/src/color-utils')

describe('color-utils', function () {
  it('配置顏色', () => {
    const color = Cutl.init()
    color.setRGB(233, 152, 111)
    should(color.r).equal(233)
    should(color.g).equal(152)
    should(color.b).equal(111)
  })
  it('非數字 RGB 數值則轉為 0', () => {
    const err_color = [undefined, null, {}, 'STRING', []]
    for (let c of err_color) {
      const color = Cutl.init(c, c, c)
      should(color.r).equal(0)
      should(color.g).equal(0)
      should(color.b).equal(0)
    }
  })
  it('非法的 RGB 數值', () => {
    const err_color = [-9, 1.1, 300];
    for (let c of err_color) {
      try {
        const color = Cutl.init(c, c, c)
      } catch (e) {
        should(e.message).containEql('非法RGB數值')
        continue
      }
      throw new Error(`使用此RGB數值（${c}）應該會拋出一個錯誤`)
    }
  })
  it('#ABC 轉換為 Cutl 對象', () => {
    const color = Cutl.init('#ABC')
    color.r.toString(16).should.equal('aa')
    color.g.toString(16).should.equal('bb')
    color.b.toString(16).should.equal('cc')
  })
  it('#6789AB 轉換為 Cutl 對象', () => {
    const color = Cutl.init('#6789AB')
    color.r.toString(16).should.equal('67')
    color.g.toString(16).should.equal('89')
    color.b.toString(16).should.equal('ab')
  })

  it('錯誤長度的顏色代碼', () => {
    const err_color = ['#1', '#12', '#1234', '#12345', '#1234567']
    for (let color_code of err_color) {
      try {
        Cutl.init(color_code)
      } catch (e) {
        should(e.message).containEql('非法顏色代碼')
        should(e.message).containEql('字符串長度是不是有問題')
        continue
      }
      throw new Error(`採用顏色代碼（${color_code})實例化時應該會拋出一個錯誤`)
    }
  })

  it('Cutl 對象轉顏色代碼', () => {
    const color = Cutl.init(48, 103, 133)
    should(color.getColorCode()).equal('#306785')
  })

  it('灰度處理', () => {
    const color = Cutl.init(103, 137, 171)
    const gray = color.toGray()
    const compare = Cutl.init(131, 131, 131)

    should(gray.getColorCode()).equal(compare.getColorCode())
  })

  it('色平均值', () => {
    const color1 = Cutl.init(103, 137, 171)
    const color2 = Cutl.init(131, 131, 131)
    const 已經運算過的顏色 = Cutl.init(117, 134, 151).getColorCode()

    const 結果 = Cutl.average(color1, color2).getColorCode()
    should(結果).equal(已經運算過的顏色)
  })

  it('色OR運算', () => {
    const color1 = Cutl.init(103, 137, 171)
    const color2 = Cutl.init(131, 131, 131)
    const 已經運算過的顏色 = Cutl.init(103|131, 137|131, 171|131).getColorCode()

    const 結果 = Cutl.or(color1, color2).getColorCode()
    should(結果).equal(已經運算過的顏色)
  })
})
