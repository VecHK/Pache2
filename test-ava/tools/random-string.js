import randomString from '../../tools/random-string';
import test from 'ava';

test('獲取隨機字符串', t => {
  let str = randomString(512);
  t.is(str.length, 512)
  t.notRegex(str, /[^A-Z]/g)
})
test('小寫的隨機字符串', t => {
  let str = randomString(512, true);
  t.is(str.length, 512)
  t.notRegex(str, /[^A-Za-z]/g)
})
