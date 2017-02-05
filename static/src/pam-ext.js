/*
	Pache 文章页增强插件集
	Pache Article Page Extend Collection

 - footnote Extend

 */
var 适配间隙 = 0;

var objExt = function (source, newobj){
	return Object.keys(newobj).filter(function (key){
		source[key] = newobj[key];
		return true;
	}).length;
};

var collectFootnote = function (){
	var pre = $('sup.footnote-ref');

	return Array.prototype.map.call(pre, function (ele){
		var a = ele.getElementsByTagName('a');
		if (a.length){
			a = a[0];
		} else {
			return undefined;
		}

		if ( a.href.indexOf('#') !== -1 ){
			return {sup: ele, a: a};
		} else {
			return false;
		}
	}).filter(function (item){
		return item !== undefined;
	});
};
var CreateSplitLayer = function (parentEle){
	this.article = parentEle;
	var
	splitLayer = document.createElement('div'),
	content = document.createElement('div'),
	greyArea = [document.createElement('div'), document.createElement('div')];

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
	window.addEventListener('resize', function (){
		this.sup && checkSize() && this.hide(function (){
			setTimeout(this.show.bind(this), 16.7);
		}.bind(this));
	}.bind(this));

	var closeSplitLayer = function (){
		this.hide();
		if ( this.sup ){
			this.sup = undefined;
		}
	}.bind(this);

	window.addEventListener('keydown', function (e){
		if ( this.sup && e.keyCode === 27 ){
			closeSplitLayer();
		}
	});
	splitLayer.className = 'split-layer';

	greyArea.forEach(function (ele){
		ele.className = 'grey-area';
		ele.addEventListener('click', closeSplitLayer, true);
	});

	content.className = 'split-content';

	splitLayer.appendChild(greyArea[0]);
	splitLayer.appendChild(content);
	splitLayer.appendChild(greyArea[1]);

	false && objExt(content.style, {
		width: parentEle.offsetWidth + 'px',
	});

	objExt(splitLayer.style, {
		display: 'flex',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%',
		left: '0px',
		top: '0px',
		border: '0',
	});

	document.body.appendChild(splitLayer);

	objExt(this, {
		parent: parentEle,
		ele: splitLayer,
		greyArea: greyArea,
		content: content,
	});
};
/* 设定 CreateSplitLayer.prototype 属性行为，以及一些公有方法*/
(function (){
	var
	xy = {
		x: 'left',
		y: 'top',
		h: 'height',
		bt: 'borderTop',
		bb: 'borderBottom',
	},
	posGet = function (d){
		return function (){
			return this.ele.style[xy[d]];
		};
	},
	posSet = function (d){
		return function (value){
			this.ele.style[xy[d]] = value + 'px';
		};
	},
	createGetOrSet = function (d){
		return {
			get: posGet(d),
			set: posSet(d),
		};
	};

	Object.defineProperties(CreateSplitLayer.prototype, {
		posX: createGetOrSet('x'),
		posY: createGetOrSet('y'),
		height: createGetOrSet('h'),
	});

	CreateSplitLayer.prototype.resize = function (){

	};
	CreateSplitLayer.prototype.show = function (cb, time){
		var thisEleR = $(this.ele);
		if (this.sup){
			适配间隙 = Number(getComputedStyle(this.sup.parentNode, null).lineHeight.replace(/px$/, ''));
			this.greyArea[0].style.height = (this.sup.offsetTop + this.sup.offsetHeight + 适配间隙 - 0) + 'px';
			this.greyArea[1].style.height = (document.body.offsetHeight - this.ele.offsetHeight) + 'px';

			thisEleR.fadeIn(cb, time);

			this.sup.style.lineHeight = (this.content.offsetHeight + this.sup.offsetHeight + 适配间隙 / 1) + 'px';
			$(this.sup).attr('status', 'open')
		}else{
			thisEleR.fadeIn(cb, time);
		}
	};
	CreateSplitLayer.prototype.hide = function (cb, time){
		if (this.sup){
			this.sup.style.lineHeight = '';
			$(this.sup).attr('status', 'close')
		}
		$(this.ele).fadeOut(cb, time);
	};
})();


/* 清除内容栏的箭头 */
var clearArrow = function (ele){
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
};

var foontnoteExtend = function (){
	const articleEle = document.getElementById('article');
	let splitLayer = new CreateSplitLayer(articleEle);

	splitLayer.hide();

	window.footnotes = collectFootnote();

	footnotes.forEach(function (footnote){
		footnote.a.style.lineHeight = '0px';
		$(footnote.a).attr('sup-text', $(footnote.a).text())
		footnote.a.innerHTML = '';

		if (footnote.sup.previousElementSibling && footnote.sup.previousElementSibling.tagName.toLowerCase() === 'h-hws') {
			$(footnote.sup.previousElementSibling).remove()
		}
		if (footnote.sup.nextElementSibling && footnote.sup.nextElementSibling.tagName.toLowerCase() === 'h-hws') {
			footnote.sup.nextElementSibling.remove()
		}
		//line-height: 0px;
		footnote.a.onclick = function (){
			splitLayer.sup = footnote.sup;

			var anthor = $$(`[href="#${footnote.a.id}"]`, articleEle);
			console.log(anthor.parentNode.innerHTML)

			splitLayer.content.innerHTML = anthor.parentNode.innerHTML;
			clearArrow(splitLayer.content);
			try {
				Han(splitLayer.content).render()
			} catch (e){}


			window.splitLayer = splitLayer;
			/*
			splitLayer.greyArea[0].style.height = (footnote.sup.offsetTop + footnote.sup.offsetHeight) + 'px';
			splitLayer.greyArea[1].style.height = (document.body.offsetHeight - splitLayer.ele.offsetHeight) + 'px';

			splitLayer.fadeIn(footnote.sup);

			footnote.sup.style.lineHeight = (splitLayer.content.offsetHeight + footnote.sup.offsetHeight) + 'px';
			*/
			splitLayer.show();

			return false;
		};
	});

};

foontnoteExtend()
