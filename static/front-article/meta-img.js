class LoadImage {
  start(url) {
    this.start_time = null
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
          this.interval = Date.now() - this.start_time
          this.emit('done', xhr.response)
        } else {
          this.emit('failure', xhr)
        }
        this.emit(`${xhr.status}`, xhr.response, xhr)
      }
    }
    xhr.onerror = e => {
      this.emit('error', xhr, e)
      console.error(e, xhr)
    }
    xhr.onloadend = e => {
      this.emit('end', xhr)
    }
    xhr.onloadstart = e => {
      this.start_time = Date.now()
      this.emit('start', url)
    }

    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  }
}
LoadImage.prototype.__proto__ = Object.create(EventLite)

class MetaImage {
  setSize(width, height) {
    $(this.container).css({
      height: `${height}px`,
      width: `${width}px`
    })
  }
  calcSize() {
    // 所有分頁的寬度都是一樣的，介於隱藏頁的寬度高度都無法獲取，故採取獲取當前分頁的寬度的策略
    const currentSplitPage = page.getPage()
    this.limitWidth = parseInt(getComputedStyle(currentSplitPage).width)

    const {availHeight} = screen

    let imgHeight = parseInt(availHeight * 0.8)

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

    return {
      width: imgWidth,
      height: imgHeight,
    }
  }
  resize() {
    if (this.lastWidth !== window.innerWidth) {
      this.lastWidth = window.innerWidth
      const {width, height} = this.calcSize()
      if (this.status) {
        this.setSize(width, height)
      } else {
        this.setSize(width, 192)
      }
    } else {
      return
    }
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

  loadDirect() {
    const imgl = this.load(100)
    imgl.on('start', url => {
      this.container.style.transition = 'height 1ms'
      const {width, height} = this.calcSize()
      this.setSize(width, height)
    })
    imgl.start(this.source)
    return imgl
  }
  setImageAndSlideDOwn(img, src) {
    img.onload = () => {
      $(img).css('opacity', '1')
      this.hideInfoElement(() => {
        $('.size', this.container).text(`${parseInt(this.size / 1024)} KB`)
      })
      // $(this.metaInfoElement).css('opacity', '0')
    }
    img.src = src
  }
  load(TIMEOUT = 720) {
    // 已加載過的圖片不會再次加載
    if (this.img.src.length) { return }

    const imgl = new LoadImage
    imgl.on('done', imgBlob => {
      $('.size', this.container).text(`Done`)
      this.blob = imgBlob
      let blobUrl = URL.createObjectURL(imgBlob)
      this.status = true
      const {width, height} = this.calcSize()
      this.setSize(width, height)

      setTimeout(() => {
        this.setImageAndSlideDOwn(this.img, blobUrl)
      }, TIMEOUT)
    })
    imgl.on('progress', percent => {
      const size = this.size / 1024
      $('.size', this.container).text(`${parseInt(size * percent)}/${parseInt(size)}`)
    })
    imgl.on('failure', xhr => {
      $('.size', this.container).text(`${xhr.status}`)
    })
    imgl.on('error', xhr => {
      if (!netStatus.isOnline()) {
        $('.size', this.container).text(`offline`)
      } else {
        $('.size', this.container).text(`ERROR`)
      }
    })
    imgl.start(this.source)
    return imgl
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

    let clickStatus
    const asideClickHandle = e => {
      if (!clickStatus) {
        clickStatus = true
        const imgl = this.load()
        imgl.on('done', e => {
          this.container.removeEventListener('click', asideClickHandle)
        })
        imgl.on('end', e => { clickStatus = false })
      }
    }
    this.container.addEventListener('click', asideClickHandle)

    let openStatus = false
    let isMove
    let start_time
    this.container.addEventListener('touchstart', e => {
      this._haveTouch = true
      isMove = false
      start_time = Date.now()
    })

    this.container.addEventListener('touchmove', e => {
      isMove = true
    })

    this.container.addEventListener('touchend', e => {
      this._haveTouch = true
      const interval = Date.now() - start_time
      console.info(interval)

      // 圖片有加載並且沒有滑動操作且按的間隔小於 300ms
      if (this.img.src.length && !isMove && interval < 300) {
        openStatus = !openStatus
        openStatus ? this.showInfoElement() : this.hideInfoElement()
      } else {
        return
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

      // 非限制網絡則直接加載
      if (!netStatus.isLimit()) {
        this.loadDirect()
      }
      // 若連接到非限制類網絡則自動加載圖片
      netStatus.on('change-to-unlimit', e => {
        if (!this.img.src.length) {
          $('.size', this.container).text('unlimited')
          setTimeout(() => this.load(), 1000)
        }
      })
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
  init() {
    const metaImgRaw_list = $('meta-img', this.container)
    this.pool = metaImgRaw_list.map(raw => new MetaImage(raw))
  }
  constructor(container) {
    this.container = container
    this.init()
  }
}
