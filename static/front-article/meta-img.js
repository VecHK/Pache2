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

      let blobUrl = URL.createObjectURL(imgBlob)
      this.resize()
      this.status = true
      this.resizeImg()
      setTimeout(() => {
        this.img.onload = () => {
          $(this.img).css('opacity', '1')
          $(this.infoElement).fadeOut(() => {
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

    let status = false
    let isMove = false
    let start
    this.container.addEventListener('touchstart', e => {
      this._haveTouch = true
      isMove = false
      if (!this.img.src.length) { return }
      start = Date.now()
    })
    this.container.addEventListener('touchmove', e => {
      isMove = true
    })
    this.container.addEventListener('touchend', e => {
      this._haveTouch = true
      if (!this.img.src.length) { return }
      const interval = Date.now() - start
      console.info(interval)
      // 按的間隔不能超過 300ms
      if (interval > 300) { return }

      if (isMove) { return }

      status = !status
      if (status) {
        $(this.infoElement).fadeIn()
      } else {
        $(this.infoElement).fadeOut()
      }
    })


    this.container.addEventListener('mouseenter', async e => {
      if (this._haveTouch) return
      if (!this.status) return
      else if (!this.floatElement) this.createFloatElement()

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
