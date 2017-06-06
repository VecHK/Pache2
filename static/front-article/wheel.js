function getElementPageX(ele, root = document.body) {
  let totalOffsetLeft = 0

  do {
    totalOffsetLeft += ele.offsetLeft
    ele = ele.parentNode
  } while (ele !== root)

  return totalOffsetLeft
}
function getElementPageY(ele, root = document.body) {
  let totalOffsetTop = 0

  while (ele !== root) {
    totalOffsetTop += ele.offsetTop
    ele = ele.parentNode
  }

  return totalOffsetTop
}
function ArrayForEach(arr, cb) {
  const LEN = arr.length
  for (let cursor = 0; cursor < LEN; ++cursor) {
    cb(arr[cursor], cursor, arr)
  }
}

const fetchElementText = (() => {
  const TEXT_NODETYPE = 3
  const ELEMENT_NODETYPE = 1
  return ele => {
    let str = ''
    ArrayForEach(ele.childNodes, child => {
      if (child.nodeType === TEXT_NODETYPE) {
        str += child.nodeValue
      } else if (child.nodeType === ELEMENT_NODETYPE) {
        str += fetchElementText(child)
      } else {
        console.warn('其他的節點？')
      }
    })
    return str
  }
})()
