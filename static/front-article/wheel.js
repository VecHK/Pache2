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
async function AsyncForEach(arr, cb) {
  const LEN = arr.length
  for (let cursor = 0; cursor < LEN; ++cursor) {
    await cb(arr[cursor], cursor, arr)
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


/* 元素是否隐藏（包括它的父元素） */
function elementIsHidden (ele) {
  if (ele.style && (getComputedStyle(ele).display === 'none')) {
    return ele
  } else if (ele.parentNode) {
    return elementIsHidden(ele.parentNode)
  } else {
    return false
  }
}

function copyArray(arr) {
  const newArray = []
  for (let cursor = 0; cursor < arr.length; cursor++) {
    newArray[cursor] = arr[cursor]
  }
  return newArray
}

function Delay(d_handle, e_handle) {
  var g_res, g_rej
  var prom = new Promise((res, rej) => {
    g_res = function() {
      prom.__DELAY__ = true
      d_handle && d_handle.apply(null, arguments)
      res.apply(null, arguments)
    }
    g_rej = function () {
      prom.__DELAY__ = false
      e_handle && e_handle.apply(null, arguments)
      rej.apply(null, arguments)
    }
  })

  prom.__DELAY__ = null
  prom.done = g_res
  prom.fail = g_rej

  return prom
}

function ObjectAssign(source, ...objs) {
  objs.forEach(obj => {
    for(let key in obj) {
      if (obj.hasOwnProperty(key)) source[key] = obj[key]
    }
  })
  return source
}

function waitting(ms = 20) {
  return new Promise(res => setTimeout(res, ms))
}

function getScrollingElement() {
  if (document.scrollingElement) {
    return document.scrollingElement
  } else {
    return $$('html')
  }
}

function getTransitionDuration (ele) {
  return getComputedStyle(ele)['transition-duration'].split(',').map(time =>
    parseFloat(time) * 1000
  ).sort((a, b) => a < b).pop()
}
function transitionDurationWait (ele) {
  return waitting(getTransitionDuration(ele))
}
