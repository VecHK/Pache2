'use strict';
import test from 'ava';
import Cutl from '../../tools/color-utils';

test('配置顏色', t => {
  const color = Cutl.init();
  const args = [123, 67, 32]
  color.setRGB(...args);
  t.is(color.r, args[0])
  t.is(color.g, args[1])
  t.is(color.b, args[2])
})

test('非數字 RGB 數值則轉換為 0', t => {
  const err_color = [undefined, null, {}, 'STRING', []];
  for (let c of err_color) {
    const color = Cutl.init(c, c, c)
    t.is(color.r, 0)
    t.is(color.g, 0)
    t.is(color.b, 0)
  }
})

test('非法的 RGB 數值', t => {
  const err_color = [-9, 1.1, 300];
  for (let c of err_color) {
    t.throws(function () {
      const color = Cutl.init(c, c, c)
    }, /非法RGB數值/)
  }
})

test('#ABC 轉換為 Cutl 對象', t => {
  const color = Cutl.init('#ABC');
  t.is(color.r.toString(16), 'aa');
  t.is(color.g.toString(16), 'bb');
  t.is(color.b.toString(16), 'cc');
})

test('#6789AB 轉換為 Cutl 對象', t => {
  const {r, g, b} = Cutl.init('#6789AB');
  t.is(r.toString(16), '67');
  t.is(g.toString(16), '89');
  t.is(b.toString(16), 'ab');
})

test('錯誤長度的顏色代碼', t => {
  const err_color = ['#1', '#12', '#1234', '#12345', '#1234567'];
  for (let c of err_color) {
    t.throws(() => {
      Cutl.init(c);
    }, /(非法顏色代碼)*(字符串長度是不是有問題)/)
  }
})

test('Cutl 實例返回一個顏色代碼（#XXXXXX 形式）', t => {
  const color = Cutl.init(48, 103, 133);
  t.is(color.getColorCode(), '#306785');
})

test('灰度處理', t => {
  const compare = Cutl.init(131, 131, 131);
  let gray = Cutl.init(103, 137, 171).toGray();

  t.is(gray.getColorCode(), compare.getColorCode())
})

test('色平均值', t => {
  const color1 = Cutl.init(103, 137, 171);
  const color2 = Cutl.init(131, 131, 131);
  const 已經運算過的顏色 = Cutl.init(117, 134, 151).getColorCode();

  const 結果 = Cutl.average(color1, color2).getColorCode();
  t.is(結果, 已經運算過的顏色)
})

test('色 OR 運算', t => {
  const color1 = Cutl.init(103, 137, 171)
  const color2 = Cutl.init(131, 131, 131)
  const 已經運算過的顏色 = Cutl.init(103|131, 137|131, 171|131).getColorCode()

  const 結果 = Cutl.or(color1, color2).getColorCode()
  t.is(結果, 已經運算過的顏色)
})
