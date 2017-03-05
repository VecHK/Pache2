/*
	Pache 文章页增强插件集
	Pache Article Page Extend Collection

 - split-layer
 - split-page

 */

/* fix IE bug */
Array.from = Array.from ? Array.from : obj => [].slice.call(obj)

class SplitLayerFootnote extends GroCreate() {
	/* 收集完成，清除原腳註元素們 */
	_collectDone(arr){
		$('.footnotes-sep', this.articleEle).remove();

		$('.footnotes', this.articleEle).css('position', 'fixed').remove();
		return arr;
	}
	collectFootnote(){
		var pre = $('sup.footnote-ref', this.articleEle);

		return this._collectDone(pre.map(ele => {
			let a = ele.getElementsByTagName('a');
			if (a.length) {
				a = a[0];
			} else {
				return undefined;
			}

			if (a.href.indexOf('#') !== -1){
				return {sup: ele, a: a};
			} else {
				return false;
			}
		}).filter(item => {
			return item !== undefined;
		}));
	}
	__construct(articleEle = document.body){
		this.articleEle = articleEle
	}
}

class Layer {
	setContent(html){
		this.content.innerHTML = html;
		this.clearArrow()
	}
	clearArrow(ele = this.content){
		let
		as = $('[href].footnote-backref', ele),
		clearEmptyNode = function (e){
			var parent = e.parentNode;
			if ( parent === ele ){
				return false;
			}
			else if ( parent.innerHTML.length ){
				return parent.removeChild(e);
			}
			else{
				return clearEmpty(parent);
			}
		};
		as.forEach(a => {
			var parent = a.parentNode;
			parent.removeChild(a);

			//clearEmptyNode(a);
		});
	}
	position(footnote = this.footnote, cb){
		const {a, sup} = footnote;
		const {contentFrame} = this;

		let lineHeight = Number(getComputedStyle(sup.parentNode, null).lineHeight.replace(/px$/g, ''));

		contentFrame.style.top = (this.articleEle.offsetTop + sup.offsetTop + lineHeight * 0.6) + 'px';

		contentFrame.style.height = (contentFrame.scrollHeight) + 'px';
		a.style.height = (contentFrame.scrollHeight + lineHeight * 1) + 'px';

		sup.style.lineHeight = (contentFrame.scrollHeight + lineHeight * 1) + 'px';

		let time = Number(getComputedStyle(this.contentFrame, null).transitionDuration.replace(/s$/g, ''));
		setTimeout(() => {
			this.emit('opened', this);
		}, time * 1000)
	}
	open(footnote = this.footnote){
		this.switch = true;
		this.emit('open', this);
		this.container.style.display = 'block';
		this.position(footnote)
	}
	close(footnote = this.footnote){
		this.switch = false;

		this.contentFrame.style.height = '0px';
		this.footnote.a.style.height = '';
		this.footnote.sup.style.lineHeight = '';
		let backObj = {
			ok(fn){ this.cb = fn }
		};

		let time = Number(getComputedStyle(this.contentFrame, null).transitionDuration.replace(/s$/g, ''))
		setTimeout(() => {
			this.emit('close', this);
			this.container.style.display = 'none';
			backObj.cb && backObj.cb();
		}, time * 1000)

		return backObj;
	}
	toggle(){
		return this[this.switch ? 'close' : 'open'](...arguments)
	}
	setCloseEvent(){
		this.bg.onclick = e => {
			if (!this.lock) {
				this.close()
			}
		};
	}
	rePosition(cb){
		return this.switch && this.close().ok(this.open.bind(this))
	}
	setResize(){
		let checkSize = (() => {
			let currentSize = document.body.scrollWidth;
			return () => {
				if (currentSize !== document.body.scrollWidth) {
					currentSize = document.body.scrollWidth;
					return true
				} else {
					return false
				}
			};
		})();
		window.addEventListener('resize', e => {
			checkSize() && this.rePosition()
		})
	}

	constructor(footnote, parentEle = document.body, container = document.createElement('div'), articleEle = $$('#article')){
		if (footnote) {
			this.footnote = footnote;
		}
		container.classList.add('split-layer');

		container.innerHTML = `
		<div class="sl-bg"></div>
		<div class="sl-content-frame">
			<div class="sl-content"></div>
		</div>
		`;

		parentEle.appendChild(container);
		this.parentEle = parentEle;
		this.container = container;
		this.articleEle = articleEle;
		this.bg = $$('.sl-bg', container);
		this.contentFrame = $$('.sl-content-frame', container);
		this.content = $$('.sl-content', container);

		this.setCloseEvent();
		this.setResize();
	}
}
PamEventEmitter.use(Layer.prototype)

class SplitLayer extends SplitLayerFootnote {
	getAnthorContent(footnote){
		$('.footnotes').css('display', 'none')
		var anthor = $$(`[href="#${footnote.a.id}"]`, $$('.footnotes'));
		return anthor.parentNode.innerHTML;
	}
	setAction(footnotes = this.footnotes){
		footnotes.forEach(footnote => {
			const supPreEle = footnote.sup.previousElementSibling;
			if (supPreEle && supPreEle.tagName.toLowerCase() === 'h-hws') {
				$(supPreEle).remove()
			}
			const supNextEle = footnote.sup.nextElementSibling;
			if (supNextEle && supNextEle.tagName.toLowerCase() === 'h-hws') {
				supNextEle.remove()
			}

			const layer = new Layer(footnote);
			footnote.layer = layer;

			layer.setContent(this.getAnthorContent(footnote));
			layer.on('open', () => { layer.lock = true })
			layer.on('opened', () => { layer.lock = false })
			footnote.a.onclick = e => {
				layer.lock || layer.toggle(footnote)
				return false;
			};
		})
	}

	__init() {
		this.footnotes = this.collectFootnote()
		this.setAction()
	}
}

const PamEvent = {};
PamEventEmitter.use(PamEvent)

class Scroller {
	/* 设定滚动事件
	direct 為 true 時為滾輪上，false 時為滾輪下
	*/
	setWheelEvent(ele = window) {
		this._canScroll = true;
		const scrollFunc = (e) => {
			e = e || window.event
			this._canScroll || e.preventDefault()

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
			directMiddle(e)
			status.lastY = e.touches[0].clientY

			if (!this._canScroll) {
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
PamEventEmitter.use(Scroller.prototype)

class PageJumper {
	_throwNoLength(){ throw new Error('渲染列表失敗：沒有指定 length 參數') }
	renderList(length = this._throwNoLength()) {
		const $pageJumperPageList = $('.page-select-list', this.pageJumperContainer)

		for (let current = 0; current < length; ++current) {
			const itemEle = document.createElement('div')
			$pageJumperPageList.append(...$(itemEle).class('page-select-item').text(current + 1))
		}
	}
	openPageJumper() {
		this.lastPageCode = this.current;
		this.scroller._canScroll = false;
		this.opened = true;
		if (this.animating) {
			return ;
		} else {
			this.animating = true
		}
		this.emit('jumper-open')

		let $frame = $(this.pageJumperContainer)
		let time = Number(getComputedStyle($frame[0], null).transitionDuration.replace(/s/g, ''))

		let cssHeight = '8em'
		$frame.css('height', '8em')

		this.scrollNumChange(this.current, `3em`)
		$('.page-jumper-content', this.pageJumperContainer).class('open')

		$('.jumper-triangle', this.pageJumperContainer).css('top', 'calc(50% - (8px))')

		setTimeout(() => {
			this.isOpen = true
			this.animating = false
			this.emit('jumper-opened')
		}, time * 1000)
	}
	closePageJumper() {
		this.opened = false;
		if (this.animating) {
			return
		} else {
			this.animating = true
		}
		this.emit('jumper-close')

		this.isOpen = false

		let $pjf = $(this.pageJumperContainer).css('height', '');
		if (this.lastPageCode !== this.current) {
			$pjf.css('bottom', '-2em')
		}
		let time = Number(getComputedStyle($pjf[0], null).transitionDuration.replace(/s/g, ''))

		//this.scrollNumChange(this.current, '-3em')
		this.scrollNumChange(this.current, '-3em')
		$('.page-jumper-content', this.pageJumperContainer).classRemove('open')

		$('.jumper-triangle', this.pageJumperContainer).css('top', '')

		setTimeout(() => {
			this.animating = false
			this.scroller._canScroll = true
			this.emit('jumper-closed')
			setTimeout(() => {
				$pjf.css('bottom', '')
			}, 300)
		}, time * 1000)
	}

	setPageJumperBtn() {
		const container = this.pageJumperContainer;

		this.on('jumper-opened', () => {
			$('.page-jumper-bg').css('display', 'block')
		})
		this.on('jumper-close', () => {
			$('.page-jumper-bg').css('display', '')
		})
		$$('.page-jumper-bg').addEventListener('click', e => {
			this.closePageJumper()
		})
	}

	pageCodeClick() { this.openPageJumper() }

	scrollDown(canBackToTop) {
		console.info('down')
		if (canBackToTop) {
			if (this.scrollNum >= this.page.length - 1) {
				this.scrollNum = 0
			} else {
				++this.scrollNum
			}
		} else {
			if (this.scrollNum >= this.page.length - 1) {
				this.scrollNum = this.page.length - 1
			} else {
				++this.scrollNum
			}
		}
	}
	scrollUp(canBackToBottom) {
		console.info('up')
		if (canBackToBottom) {
			if (this.scrollNum <= 0) {
				this.scrollNum = this.page.length - 1
			} else {
				--this.scrollNum
			}
		} else {
			if (this.scrollNum <= 0) {
				this.scrollNum = 0
			} else {
				--this.scrollNum
			}
		}
	}
	scrollNumChange(scrollNum, plusItem = '0px') {
		const totalHeight = $$('.page-select-list', this.pageJumperContainer).offsetHeight;
		const scrollHeight = this.pageJumperContainer.offsetHeight;

		const $items = $('.page-select-item', this.pageJumperContainer)
		let height = $items[scrollNum].offsetHeight;
		console.warn(scrollNum)

		$('.page-select-list', this.pageJumperContainer).css({
			margin: `calc((${scrollHeight}px / 2) - (${height}px / 2) - ${height * (scrollNum)}px + ${plusItem}) 0`
		})

		$('.page-select-list .current', this.pageJumperContainer).classRemove('current')
		$($items[scrollNum]).class('current')
	}

	setpageJumper(container = $$('.page-jumper-frame')) {
		this.scroller = new Scroller(window, $$('.page-jumper-content', container));
		console.info(this.scroller)
		this.pageJumperContainer = container
		this.setPageJumperBtn()

		$$('.page-jumper-content', container).addEventListener('click', e => {
			if (!this.opened) {
				this.openPageJumper()
			}
		})

		this.renderList(this.page.length)

		let _scrollNum = 0
		Object.defineProperty(this, 'scrollNum', {
			get(){ return _scrollNum },
			set(value){
				_scrollNum = value
				this.scrollNumChange(_scrollNum)
				return _scrollNum
			},
		})

		const 調整頁碼 = pagecode => this.scrollNum = pagecode;
		this.on('換頁', 調整頁碼)
		調整頁碼(this.current)

		this.scroller.on('滾輪-上', () => {
			this.isOpen && this.scrollUp(true)
		})
		this.scroller.on('滾輪-下', () => {
			this.isOpen && this.scrollDown(true)
		})

		this.scroller.on('上滑', () => {
			this.isOpen && this.scrollDown()
		})

		this.scroller.on('下滑', () => {
			this.isOpen && this.scrollUp()
		})
	}
}

class SplitPage extends PageJumper {
	throwNoContainer(){
		throw new Error('splitPage 初始化失败：没有指定容器')
	}
	init(container = this.throwNoContainer()){
		this.container = container;
		this.page = [];
		this.current = 0;
	}

	viewerTopMoreThanArticle(){
		/* 兼容 IE11 */
		const scrollableElementScrollTop = $$('html').scrollTop || $$('body').scrollTop || 0
		return scrollableElementScrollTop > this.container.offsetTop
	}

	previousPage(current, previous){
		$(previous).css({
			position: this.viewerTopMoreThanArticle() ? '' : 'absolute',
			display: 'block',
		})

		setTimeout(() => {
			$(previous).class('current-page')
			$(current).classRemove('current-page')

			setTimeout(() => {
				$(previous).class('solid-page').css('position', '')
				if (this.viewerTopMoreThanArticle()) {
					scrollTo(document.body, this.scrollTop)
				}
				$(current).classRemove('solid-page').css('display', 'none')
			}, 618)
		}, 32)

		this.emit('換頁', this.current, this)
	}
	clickPrevious() {
		return this.jumpTo(this.current - 1)
	}

	nextPage(current, next){
		$(next).css({
			position: this.viewerTopMoreThanArticle() ? '' : 'absolute',
			display: 'block',
		})

		setTimeout(() => {
			$(next).class('current-page')
			$(current).classRemove('current-page')
			setTimeout(() => {
				$(next).class('solid-page').css('position', '')
				if (this.viewerTopMoreThanArticle()) {
					scrollTo(document.body, this.scrollTop)
				}
				$(current).classRemove('solid-page').css('display', 'none')
			}, 618)
		}, 32)

		this.emit('換頁', this.current, this)
	}
	clickNext() {
		return this.jumpTo(this.current + 1)
	}

	setBottomBtn(parentContainer, cursor, totalHtml) {
		const nextBtn = document.createElement('button')
		const $nextBtn = $(nextBtn).class('next', 'page-btn').text('>')

		this.nextBtn = nextBtn

		const pageLabel = document.createElement('buttion')
		const $pageLabel = $(pageLabel).class('page-code', 'page-btn').text(cursor + 1)
		pageLabel.addEventListener('click', this.pageCodeClick.bind(this))

		const previousBtn = document.createElement('button')
		const $previousBtn = $(previousBtn).class('previous', 'page-btn').text('<')
		this.previousBtn = previousBtn

		// 翻页按钮栏
		const pageBtnPanel = document.createElement('section')
		const $pageBtnPanel = $(pageBtnPanel).class('bottom', 'page-btn-panel')
		$pageBtnPanel.append(previousBtn, pageLabel, nextBtn)

		// 第一頁的情況
		if (!this.page.length) {
			$previousBtn.css('visibility', 'hidden')
		} else {
			previousBtn.onclick = this.clickPrevious.bind(this)
		}
		// 尾頁的情況
		if ((cursor + 1) === totalHtml.length) {
			$nextBtn.css('visibility', 'hidden')
		} else {
			nextBtn.onclick = this.clickNext.bind(this)
		}

		parentContainer.appendChild(pageBtnPanel)
	}

	setTopBtn(parentContainer = $$('.page-btn-panel.top')) {
		const nextBtn = document.createElement('button')
		const $nextBtn = $(nextBtn).class('next', 'page-btn').text('>')
		nextBtn.addEventListener('click', this.clickNext.bind(this))
		this.topNextBtn = nextBtn

		const pageLabel = document.createElement('a')
		const $pageLabel = $(pageLabel).class('page-code', 'page-btn').text('首頁').setAttr('href', '/');

		const previousBtn = document.createElement('button')
		const $previousBtn = $(previousBtn).class('previous', 'page-btn').text('<')
		previousBtn.addEventListener('click', this.clickPrevious.bind(this))
		this.previousBtn = previousBtn

		const onPaging = (newPageCode) => {
			// 第一頁的情況
			if (!newPageCode) {
				$previousBtn.css('visibility', 'hidden')
			} else {
				$previousBtn.css('visibility', '')
			}

			// 尾頁的情況
			if ((newPageCode + 1) === this.page.length) {
				$nextBtn.css('visibility', 'hidden')
			} else {
				$nextBtn.css('visibility', '')
			}
		};
		this.on('換頁', onPaging)
		this.emit('換頁', this.current)

		$(parentContainer).append(previousBtn, pageLabel, nextBtn)
	}

	jumpTo(pageCode) {
		if (pageCode === this.current) {
			return
		}
		const current = this.current
		this.current = pageCode
		if (pageCode > current) {
			this.nextPage(this.page[current], this.page[pageCode])
		} else {
			this.previousPage(this.page[current], this.page[pageCode])
		}
	}
	setJumperEvent() {
		this.on('jumper-close', () => {
			this.jumpTo(this.scrollNum)
		})
	}

	setSplitPage(){
		let containerHTML = this.container.innerHTML;

		$('.page', this.container).forEach((pageEle, pageCursor, pageTotal) => {
			const resizeHandle = e => {
				let 剩余高度 = screen.height;
				pageEle.style.minHeight = `calc(${剩余高度}px - 2em)`
			};
//			window.addEventListener('resize', resizeHandle)
			resizeHandle()

			/* 不到兩頁的情況下不顯示跳頁對話框及其跳頁對話框按鈕 */
			if (pageTotal.length <= 1) {
				$('.page-jumper').css('display', 'none')
			}

			this.page.push(pageEle);

			if (pageEle.className.indexOf('current-page') !== -1) {
				this.show(pageEle)
			} else {
				this.rebound(pageEle)
			}

			let pageEleHan = Han(pageEle).render()
			const splitLayer = new SplitLayer(pageEle)
		})
		this.scrollTop = $$('article').offsetTop
		window.addEventListener('resize', e => {
			this.scrollTop = $$('article').offsetTop
		})

		this.setTopBtn()
		this.setpageJumper()
		this.setJumperEvent()

		this.container.classList.add('splited')
	}
	/* 弹出 page 元素 */
	rebound(pageEle){
		pageEle.classList.remove('solid-page')
		pageEle.classList.remove('current-page')
		let time = Number(getComputedStyle(pageEle, null).transitionDuration.replace(/s/g, ''))
		setTimeout(() => {
			pageEle.style.display = 'none'
		}, time * 1000)
	}

	/* 显示 page 元素 */
	show(pageEle){
		pageEle.style.display = 'block';
		pageEle.classList.add('current-page')
		pageEle.classList.add('solid-page')
	}
	position(){}
	split(){
		//this.splitElements = this.getSplitElements()
		this.setSplitPage()
	}
}
PamEventEmitter.use(SplitPage.prototype)


class FrontFrame {
	constructor(){
		let article = $$('#article');
		let sp = new SplitPage;
		sp.init(article);
		sp.split();
		this.sp = sp;
		console.log(sp);
	}
}

let ff = new FrontFrame;
