class LoadImage {
  start(url) {
    const xhr = new XMLHttpRequest
    this.xhr = xhr
    xhr.onprogress = e => {
      const percent = parseFloat((e.loaded / e.total).toFixed(2))
      this.emit('progress', percent)
    }
    xhr.onload = e => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 304) {
          // const blobObject = new Blob([xhr.response], { type: xhr.getResponseHeader('content-type') })
          this.emit('done', xhr.response)
        }
      }
    }
    xhr.onloadstart = e => {
      this.emit('start', url)
    }

    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  }
}
LoadImage.prototype.__proto__ = Object.create(EventLite)

class MetaImage {
  resizeWithOpen() {}
  resize() {
    if (this.lastWidth === window.innerWidth && this.status) {
      return
    } else {
      this.lastWidth = window.innerWidth
    }

    this.limitWidth = this.container.parentNode.offsetWidth

    const {innerHeight} = window

    let imgHeight = parseInt(innerHeight * 0.8)

    if (imgHeight > this.height) {
      imgHeight = this.height
    }

    let imgWidth = parseInt(imgHeight * this.ratio)

    if (imgWidth > this.limitWidth) {
      this.base = 'width'
      imgWidth = this.limitWidth
      imgHeight = imgWidth / this.ratio
    } else {
      this.base = 'height'
    }

    this.resizeImg = function () {
      $(this.container).css({
        height: this.status ? `${imgHeight}px` : '192px',
        width: `${imgWidth}px`,
      })
    }
    this.resizeImg()
  }
  createFloatElement() {
    this.floatElement = document.createElement('div')
    this.floatElement.classList.add('float')
    $(this.floatElement).html(`
      <div class="type">${this.type.toUpperCase()}</div>
      <div class="pixel">${this.width}×${this.height}</div>
      <div class="size">${parseInt(this.size / 1024)} KB</div>
    `)

    this.container.appendChild(this.floatElement)
  }
  load() {
    if (this.img.src.length) { return }

    const imgl = new LoadImage
    imgl.on('done', imgBlob => {
      $('.size', this.container).text(`Done`)
      this.blob = imgBlob
      let blobUrl = URL.createObjectURL(imgBlob)
      this.resize()
      this.status = true
      this.resizeImg()
      setTimeout(() => {
        this.img.onload = () => {
          $(this.img).css('opacity', '1')
          this.hideInfoElement(() => {
            $('.size', this.container).text(`${parseInt(this.size / 1024)} KB`)
          })
          // $(this.metaInfoElement).css('opacity', '0')
        }
        this.img.src = blobUrl
      }, 720)
    })
    imgl.on('progress', percent => {
      const size = this.size / 1024
      $('.size', this.container).text(`${parseInt(size * percent)}/${parseInt(size)}`)
    })
    imgl.on('start', url => {})
    imgl.start(this.source)
  }
  showInfoElement(callback) {
    if (this._needNoneDisplay) {
      $(this.infoElement).fadeIn(callback)
    } else {
      $(this.infoElement).css('opacity', '1')
      setTimeout(callback, 618)
    }
  }
  hideInfoElement(callback) {
    if (this._needNoneDisplay) {
      $(this.infoElement).fadeOut(callback)
    } else {
      $(this.infoElement).css('opacity', '0')
      setTimeout(callback, 618)
    }
  }
  infoElement() {
    const aside = document.createElement('aside')
    aside.innerHTML = `
      <table class="meta-info">
        <tr>
          <td class="type">${this.type.toUpperCase()}</td>
          <td><table class="dimension meta-info">
            <tr><td class="pixel">${this.width}×${this.height}</td></tr>
            <tr><td><hr></td></tr>
            <tr><td class="size">${parseInt(this.size / 1024)} KB</td></tr>
          </table></td>
        </tr>
      </table>
    `
    this.metaInfoElement = $$('.meta-info', aside)

    this.status = false
    const that = this
    const asideClickHandle = e => {
      this.load()
      this.container.removeEventListener('click', asideClickHandle)
    }
    this.container.addEventListener('click', asideClickHandle)

    const RANGE = 48
    const sourcePoint = {
      x: 0,
      y: 0,
    }
    let haveDirect = false
    let direct
    let mode
    let setX = 0
    let setY = 0
    let isLock
    const touchPointProcess = e => {
      const currentPoint = e.touches[0]

      const currentX = currentPoint.clientX
      const currentY = currentPoint.clientY
      haveDirect = true
      if (currentY < (0 + RANGE)) {
        // 是否在上部
        direct = 'top'
        mode = 'y'
        // console.info('isTopStatus')
      } else if (currentY > (window.innerHeight - RANGE)) {
        // 是否在下部
        direct = 'bottom'
        mode = 'y'
        // console.info('isBottomStatus')
      } else if (currentX < (0 + RANGE)) {
        // 是否在左部
        direct = 'left'
        mode = 'x'
        // console.info('isLeftStatus')
      } else if (currentX > (window.innerWidth - RANGE)) {
        // 是否在右部
        direct = 'right'
        mode = 'x'
        // console.info('isRightStatus')
      } else {
        haveDirect = false
      }

      if (haveDirect) {}
      else if (currentX > (sourcePoint.x + RANGE) && !haveDirect) {
        // right
        if (typeof(mode) !== 'string') {
          mode = 'x'
          direct = 'right'
        }
      } else if (currentX < (sourcePoint.x - RANGE) && !haveDirect) {
        // left
        if (typeof(mode) !== 'string') {
          mode = 'x'
          direct = 'left'
        }
      } else if (currentY < (sourcePoint.y - RANGE) && !haveDirect) {
        // top
        if (typeof(mode) !== 'string') {
          mode = 'y'
          direct = 'top'
        }
      } else if (currentY > (sourcePoint.y + RANGE) && !haveDirect) {
        // bottom
        if (typeof(mode) !== 'string') {
          mode = 'y'
          direct = 'bottom'
        }
      } else {
        mode = null
      }

      const offsetX = lastPoint.clientX - currentPoint.clientX
      const offsetY = lastPoint.clientY - currentPoint.clientY

      lastPoint = currentPoint

      const {style} = this.container
      if (mode === 'x') {
        setX += offsetX
        isLock = true
        // style.transform = `translateX(${-setX}px)`
      } else if (mode === 'y') {
        setY += offsetY
        isLock = true
        // style.transform = `translateY(${-setY}px)`
      } else {
        setX += offsetX
        setY += offsetY
        isLock && navigator.vibrate && navigator.vibrate([50])
        isLock = false
      }
      style.transform = `translate(${-setX}px, ${-setY}px)`

      console.log(offsetX, offsetY)
    };

    const activeHandleEnd = e => {
      if (direct === 'bottom') {
        const lnk = document.createElement('a')
        if (lnk.download) {
          lnk.href = this.img.src;
          lnk.download = this.source.split(/\//).pop()
          lnk.click()
        }

      }
      console.info('direct is:', direct)

      setX = 0
      setY = 0
      this.container.style.transition = 'transform 618ms'
      setTimeout(() => {
        this.container.style.transform = `translate(0px, 0px)`
        setTimeout(() => {
          this.container.style.transition = ''
        }, 618)
      }, 32)
    }

    let status = false
    let isMove
    let isActive
    let isEnd
    let start
    let startPoint = null
    let lastPoint = null
    const activeHandle = e => {
      if (isEnd) { return }
      if (isMove) { return }
      isActive = true

      direct = ''
      haveDirect = false

      console.log('active')
      navigator.vibrate && navigator.vibrate([50])

      const currentPoint = e.touches[0]

      const currentX = currentPoint.clientX
      const currentY = currentPoint.clientY
      sourcePoint.x = currentX
      sourcePoint.y = currentY
      if (currentY < (0 + RANGE)) {
        // 是否在上部
        sourcePoint.y = RANGE
      } else if (currentY > (window.innerHeight - RANGE)) {
        // 是否在下部
        sourcePoint.y = window.innerHeight - RANGE
      }
      if (currentX < (0 + RANGE)) {
        // 是否在左部
        sourcePoint.x = RANGE
      } else if (currentX > (window.innerWidth - RANGE)) {
        // 是否在右部
        sourcePoint.x = window.innerWidth - RANGE
      }
      console.log('sourcePoint:', sourcePoint)
      touchPointProcess(e)
    }
    this.container.addEventListener('touchstart', e => {
      if (!this.img.src.length) { return }
      startPoint = e.touches[0]
      lastPoint = e.touches[0]

      this._haveTouch = true
      isMove = false
      isActive = false
      isEnd = false
      start = Date.now()

      setTimeout(activeHandle, 500, e)
    })

    this.container.addEventListener('touchmove', e => {
      isMove = true
      if (!isActive) { return }
      e.preventDefault()
      touchPointProcess(e)
    })
    this.container.addEventListener('touchend', e => {
      startPoint = null
      isEnd = true
      clearTimeout(activeHandle)
      this._haveTouch = true
      if (!this.img.src.length) { return }
      const interval = Date.now() - start
      console.info(interval)

      if (isActive) { activeHandleEnd(e); return }

      // 按的間隔不能超過 300ms
      if (interval > 300) { return }

      if (isMove) { return }
      if (isActive) { return }

      status = !status
      if (status) {
        this.showInfoElement()
      } else {
        this.hideInfoElement()
      }
    })


    this.container.addEventListener('mouseenter', async e => {
      if (this._haveTouch) return
      if (!this.status) return
      else if (!this.floatElement) this.createFloatElement()

      this._needNoneDisplay = true
      this.infoElement.style.display = 'none'

      if (this._mouseleaveWaitting) {
        await Promise.all([this._mouseleaveWaitting])
        await waitting(100)
      }

      if (this.mouseIsEnter) {
        return
      } else {
        this.mouseIsEnter = true
      }

      $(this.floatElement).removeCss('display')
      await waitting(20)

      $(this.floatElement).css({
        opacity: 1,
        left: '100%',
      })

      this._mouseenterWaitting = waitting(618).then(() => delete this._mouseenterWaitting)
    })
    this.container.addEventListener('mouseleave', async e => {
      if (this._haveTouch) return
      if (!this.status) return
      else if (!this.floatElement) this.createFloatElement()

      if (this._mouseenterWaitting) {
        await Promise.all([this._mouseenterWaitting])
        await waitting(100)
      }

      $(this.floatElement).removeCss('opacity', 'left')
      this._mouseleaveWaitting = waitting(618).then(() => delete this._mouseleaveWaitting)
      await this._mouseleaveWaitting
      if (!this._mouseenterWaitting) {
        this.mouseIsEnter = false
        $(this.floatElement).css('display', 'none')
      }
    })

    return aside
  }
  printInfo() {
    this.container.innerHTML = ''
    this.img = new Image
    this.img.setAttribute('meta-source', this.source)
    this.img.style.opacity = 0

    this.infoElement = this.infoElement()
    $(this.container).append(this.img, this.infoElement)

    this.resize()
  }
  failure() {
    alert()
  }
  init() {
    this.resizeHandle && window.removeEventListener('resize', this.resizeHandle)
    this.resizeHandle = e => {
      this.resize(e)
    }
    window.addEventListener('resize', e => { this.resize(e) })

    const {container} = this

    this.source = container.getAttribute('meta-source')
    const height = parseInt(container.getAttribute('meta-height'))
    const width = parseInt(container.getAttribute('meta-width'))
    ObjectAssign(this, {
      height,
      width,
      ratio: width / height,
      type: container.getAttribute('meta-type'),
      size: container.getAttribute('meta-size'),
    })

    if (this.height && this.width && this.type) {
      this.printInfo()
    } else {
      this.failure()
    }
  }
  constructor(container) {
    this.container = container
    this.init()
  }
}

class MetaImageFrame {
  loadAllImage() {
    this.pool.forEach(metaImg => metaImg.load())
  }
  init() {
    const metaImgRaw_list = $('meta-img', this.container)
    this.pool = metaImgRaw_list.map(raw => new MetaImage(raw))

    const connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection || navigator.MozConnection || navigator.msConnection
    if (connection === undefined) {
      this.loadAllImage()
    } else if (navigator.connection.type === 'wifi') {
      this.loadAllImage()
    }
  }
  constructor(container) {
    this.container = container
    this.init()
  }
}
