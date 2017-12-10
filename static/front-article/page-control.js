
// thanks: http://blog.csdn.net/yanyang1116/article/details/77154487
function createSVGElement(svgContent) {
  const ele = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const svgHack = document.createElement('div')

  svgHack.innerHTML = "<svg>" + svgContent + "</svg>"

  let svgHackTextNode = svgHack.childNodes[0].childNodes

  for (let i = 0; i < svgHackTextNode.length; i++) {
    // console.warn(svgHackTextNode[i])
    ele.appendChild(svgHackTextNode[i])
  }

  return ele
}

class PageControlConstructor extends ClassConstruct() {
  createSwitcher(svgContent, mount) {
    const SVG = createSVGElement(svgContent)
    ObjectAssign(SVG.style, {
      width: '100%',
      height: '100%',
      transition: 'width 618ms',
    })

    mount.appendChild(SVG)

    return SVG
  }

  get 'changeHandle' () {
    return () => {
      const {page} = this

      if (page.page_code) {
        this.showPrevious()
      } else {
        this.hidePrevious()
      }

      if (page.page_code >= (page.page_list.length - 1)) {
        this.hideNext()
      } else {
        this.showNext()
      }
    }
  }

  hidePrevious () {
    $(this.previousElement).css({
      transform: 'translateX(-16px)',
      opacity: 0,
    })
    waitting(630).then(() => {
      this.previousElement.style.transitionDuration = '0s'
      $(this.previousElement).css({
        transform: 'translateX(12px)',
      })
      return waitting()
    }).then(() => {
      this.previousElement.style.transitionDuration = ''
    })
  }
  showPrevious () {
    $(this.previousElement).css({
      transform: 'translateX(-8px)',
      opacity: 1,
    })
    this.previousSVG.style.width = '100%'
  }
  'previousInit' () {
    const svgContent = `<line x1="75%" y1="10%" x2="20%" y2="50%" style="stroke:rgb(127, 127, 127);stroke-width:2; stroke-linecap:round; stroke-linejoin: miter;" />
    <line x1="75%" y1="90%" x2="20%" y2="50%" style="stroke:rgb(127, 127, 127);stroke-width:2; stroke-linecap:round; stroke-linejoin: miter;" />`
    this.previousSVG = this.createSwitcher(svgContent, this.previousElement)
    this.previousElement.addEventListener('click', e => {
      this.emit('previous-click-before')
      if (page.page_code) {
        this.emit('click', 'previous', this.page.previous())
      }
    })
  }

  hideNext () {
    $(this.nextElement).css({
      transform: 'translateX(16px)',
      opacity: 0,
    })

    waitting(630).then(() => {
      this.nextElement.style.transitionDuration = '0s'
      $(this.nextElement).css({
        transform: 'translateX(-12px)',
        opacity: 0,
      })
      return waitting()
    }).then(() => {
      this.nextElement.style.transitionDuration = ''
    })
    // this.nextSVG.style.width = '1px'
  }
  showNext () {
    $(this.nextElement).css({
      transform: 'translateX(8px)',
      opacity: 1,
    })
    this.nextSVG.style.width = '100%'
  }
  'nextInit' () {
    const svgContent = `<line x1="25%" y1="10%" x2="80%" y2="50%" style="stroke:rgb(127, 127, 127);stroke-width:2; stroke-linecap:round; stroke-linejoin: miter;" />
    <line x1="25%" y1="90%" x2="80%" y2="50%" style="stroke:rgb(127, 127, 127);stroke-width:2; stroke-linecap:round; stroke-linejoin: miter;" />`
    this.nextSVG = this.createSwitcher(svgContent, this.nextElement)
    this.nextElement.addEventListener('click', e => {
      this.emit('next-click-before')
      if (page.page_code < (page.page_list.length - 1)) {
        this.emit('click', 'next', this.page.next())
      }
    })
  }

  '-click-' (type, status) {
    this.emit(`${type}-click`, status)
  }

  'init' (container, page) {
    this.container = container
    this.page = page

    this.previousElement = $$('.previous', container)
    this.nextElement = $$('.next', container)

    this.previousInit()
    this.nextInit()

    this.changeHandle()
    page.on('page-code-change', (...args) => {
      if (!this.disable_page_code_change) {
        this.changeHandle(...args)
      }
    })
  }
}

class PageControl extends PageControlConstructor {
  'construct' () {
    this.SELF = PageControl
    this.emitHook((ev_name, ...args) => {
      this.SELF.bus.emit(ev_name, ...args)
    })
  }
}
PageControl.bus = EventLite.create({})
