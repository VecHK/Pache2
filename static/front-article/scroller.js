class Scroller {
	/* 设定滚动事件
	direct 為 true 時為滾輪上，false 時為滾輪下
	*/
	setWheelEvent(ele = window) {
    this.enable = false
		const scrollFunc = (e) => {
			e = e || window.event
      if (!this.enable) { return }
      if (this.preventDefault) {
        e.preventDefault()
      }

			let direct = (e.wheelDelta || e.detail) > 0
			if (e.wheelDelta === undefined) {
				// firefox
				direct = !direct
			}
			this.emit(`滾輪-${direct ? '上' : '下'}`)
		};

		if (ele.onmousewheel !== undefined) {
			// IE/Opera/Chrome
			document.addEventListener('mousewheel', scrollFunc, true)
		} /*else if (ele.onwheel !== undefined) {
			// fireFox new
			ele.onwheel = scrollFunc
		} */else {
			// fireFox old
			document.addEventListener('DOMMouseScroll', scrollFunc, true)
		}
	}
	setTouchEvent(touchEle) {
		let 滑動靈敏度 = 75
		let status = {
			x: 0,
			y: 0,
		}
		let directMiddle = e => {
			if (status.lastY > e.touches[0].clientY) {
				/* 上一次觸點比這一次高（上滑方向） */
				if (status.scrollUpDirect !== true) {
					status.y = e.touches[0].clientY
					status.scrollUpDirect = true
				}
			} else {
				if (status.scrollUpDirect !== false) {
					status.y = e.touches[0].clientY
					status.scrollUpDirect = false
				}
			}
		}
		window.addEventListener('touchstart', e => {
			this.isTouch = true
			status.x = e.touches[0].clientX
			status.y = e.touches[0].clientY
			status.startY = e.touches[0].clientY

			directMiddle(e)
		})
		window.addEventListener('touchend', e => {
			this.isTouch = false
		})
		window.addEventListener('touchmove', e => {
      if (!this.enable) { return }
			directMiddle(e)
			status.lastY = e.touches[0].clientY

			if (this.preventDefault) {
				e.preventDefault()
			}

			let diffY = status.y - e.touches[0].clientY
			if (Math.abs(diffY) < 滑動靈敏度) {
				return
			}
			status.y = e.touches[0].clientY

			/* 觸摸點在開始點上方 */
			if (diffY > 0) {
				this.emit('上滑')
			} else {
				this.emit('下滑')
			}
		}, { passive: false })

	}
	constructor(scrollEle = window, touchEle = window) {
		this.setWheelEvent(scrollEle)
		this.setTouchEvent(touchEle)
	}
}

Scroller.prototype.__proto__ = Object.create(EventLite)
