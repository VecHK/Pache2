/*
	Pache 文章页增强插件集
	Pache Article Page Extend Collection

 - split-layer
 - split-page

 */
var 适配间隙 = 0;

var objExt = function (source, newobj){
	return Object.keys(newobj).filter(function (key){
		source[key] = newobj[key];
		return true;
	}).length;
};

class SplitLayerFootnote {
	collectFootnote(){
		var pre = $('sup.footnote-ref', this.articleEle);

		return pre.map(ele => {
			let a = ele.getElementsByTagName('a');
			if (a.length){
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
		});
	}

	constructor(articleEle = document.body){
		this.articleEle = articleEle;

		this.init();
	}
}
class Layer {
	setContent(html){
		this.content.innerHTML = html;
		this.clearArrow()
	}
	clearArrow(ele = this.content){
		var
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
	init(){
		this.footnotes = this.collectFootnote();
		this.setAction();
	}
}

class SplitPage {
	throwNoContainer(){
		throw new Error('splitPage 初始化失败：没有指定容器')
	}
	init(container = this.throwNoContainer()){
		this.container = container;
		this.page = [];
		this.current = 0;
	}

	viewerTopMoreThanArticle(scrollableElement = document.body){
		return scrollableElement.scrollTop > this.container.offsetTop;
	}

	getSplitElements(){
		return $('.split-page', this.container).filter(ele => ele.parentNode === this.container)
	}

	createSplitPage(){
		let containerHTML = this.container.innerHTML;
		this.container.innerHTML = '';

		(() => {
			if (this.splitElements.length) {
				console.log(containerHTML.split(this.splitElements[0].outerHTML))
				console.info(containerHTML);
				console.warn(this.splitElements[0].outerHTML);
				return containerHTML.split(this.splitElements[0].outerHTML)
			} else {
				return [containerHTML]
			}
		})()
		.map((html, cursor, totalHtml) => {
			if (html.length) {
				let pageEle = document.createElement('div');
				pageEle.classList.add('page');
				pageEle.innerHTML = html;

				let scrollTop = $$('article').offsetTop;
				window.addEventListener('resize', e => {
					scrollTop = $$('article').offsetTop
				})

				let nextBtn = document.createElement('button');
				$(nextBtn).text('下一页');
				nextBtn.classList.add('next');
				nextBtn.classList.add('page-btn');
				nextBtn.onclick = e => {
					++this.current;

					this.page[this.current].style.position = this.viewerTopMoreThanArticle() ? '' : 'absolute';
					this.page[this.current].style.display = 'block';

					setTimeout(() => {
						this.page[this.current].classList.add('current-page')
						pageEle.classList.remove('current-page')
						setTimeout(() => {
							console.warn(scrollTop)
							if (this.viewerTopMoreThanArticle()) {
								scrollTo(document.body, scrollTop)
							}
							this.page[this.current].classList.add('solid-page')
							pageEle.classList.remove('solid-page')

							pageEle.style.display = 'none'
							this.page[this.current].style.position = ''
						}, 700)
					}, 100)
				};

				let previousBtn = document.createElement('button');
				$(previousBtn).text('上一页');
				previousBtn.classList.add('previous');
				previousBtn.classList.add('page-btn');
				previousBtn.onclick = e => {
					--this.current;
					this.page[this.current].style.position = this.viewerTopMoreThanArticle() ? '' : 'absolute';
					this.page[this.current].style.display = 'block';
					setTimeout(() => {
						this.page[this.current].classList.add('current-page')
						pageEle.classList.remove('current-page')
						setTimeout(() => {
							this.viewerTopMoreThanArticle() && scrollTo(document.body, scrollTop);

							pageEle.classList.remove('solid-page')
							this.page[this.current].classList.add('solid-page')
							pageEle.style.display = 'none';
						}, 700)
					}, 100)
				};
				/* 翻页按钮栏 */
				const pageBtnPanel = document.createElement('section')
				pageBtnPanel.classList.add('page-btn-panel')
				/* 非第一页 */
				if (cursor) {
					pageBtnPanel.appendChild(previousBtn)
				}
				/* 非最后一页 */
				if ((totalHtml.length - 1) !== cursor) {
					pageBtnPanel.appendChild(nextBtn)
				}
				pageEle.appendChild(pageBtnPanel)

				this.page.push(pageEle);
				if (this.page.length === 1) {
					this.show(pageEle)
				} else {
					this.rebound(pageEle)
				}
				let pageEleHan = Han(pageEle).render()
				this.container.appendChild(pageEle)
				setTimeout(() => {
					const splitLayer = new SplitLayer(pageEle)
				}, 100);
			}
		})
	}
	/* 弹出 page 元素 */
	rebound(pageEle){
		pageEle.classList.remove('solid-page')
		pageEle.classList.remove('current-page')
		let time = Number(getComputedStyle(pageEle, null).transitionDuration.replace(/s/g))
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
		this.splitElements = this.getSplitElements()
		this.createSplitPage()
	}
}

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
document.body.style.opacity = '';
