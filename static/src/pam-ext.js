/*
	Pache 文章页增强插件集
	Pache Article Page Extend Collection

 - split-layer

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
		var pre = $('sup.footnote-ref', this.article);

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
	position(footnote = this.footnote){
		const {sup} = footnote;
		const {contentFrame} = this;

		let lineHeight = Number(getComputedStyle(sup.parentNode, null).lineHeight.replace(/px$/g, ''));

		contentFrame.style.top = (sup.offsetTop + lineHeight) + 'px';

		sup.style.lineHeight = (contentFrame.scrollHeight + lineHeight) + 'px';

		contentFrame.style.height = (contentFrame.scrollHeight) + 'px';
	}
	open(footnote = this.footnote){
		this.switch = true;
		this.container.style.display = 'block';
		this.position(footnote)
	}
	close(footnote = this.footnote){
		this.switch = false;
		this.contentFrame.style.height = '0px';
		this.footnote.sup.style.lineHeight = '';
		let backObj = {
			ok(fn){ this.cb = fn }
		};

		let time = Number(getComputedStyle(this.contentFrame, null).transitionDuration.replace(/s$/g, ''))
		setTimeout(() => {
			this.container.style.display = 'none';
			backObj.cb && backObj.cb();
		}, time * 1000)

		return backObj;
	}
	setCloseEvent(){
		this.bg.onclick = e => {
			this.close();
		};
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
			this.switch && checkSize() && this.close().ok(this.open.bind(this))
		})
	}

	constructor(footnote, parentEle = document.body, container = document.createElement('div')){
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
		this.bg = $$('.sl-bg', container);
		this.contentFrame = $$('.sl-content-frame', container);
		this.content = $$('.sl-content', container);

		this.setCloseEvent();
		this.setResize();
	}
}
class SplitLayer extends SplitLayerFootnote {
	getAnthorContent(footnote){
		var anthor = $$(`[href="#${footnote.a.id}"]`, this.article);
		return anthor.parentNode.innerHTML;
	}
	setAction(footnotes = this.footnotes){
		footnotes.forEach(footnote => {
			if (footnote.sup.previousElementSibling && footnote.sup.previousElementSibling.tagName.toLowerCase() === 'h-hws') {
				$(footnote.sup.previousElementSibling).remove()
			}
			if (footnote.sup.nextElementSibling && footnote.sup.nextElementSibling.tagName.toLowerCase() === 'h-hws') {
				footnote.sup.nextElementSibling.remove()
			}

			const layer = new Layer(footnote);
			footnote.layer = layer;

			layer.setContent(this.getAnthorContent(footnote));

			footnote.a.onclick = e => {
				layer.open(footnote);
				return false;
			};
		})
	}
	init(){
		this.footnotes = this.collectFootnote();
		this.setAction();
	}
}

let splitLayer = new SplitLayer(document.getElementById('article'))
