class AutoTextArea extends PamEventEmitter {
	resizeHandle(textarea, fill, e={}) {
		/* pre 有个奇怪的问题，它的 textContent 末尾如果只有个 \n 话它是不会增高的，故要加个空格进去 */
		if (textarea.value[textarea.value.length - 1] === '\n') {
			fill.textContent = textarea.value + ' ';

			/* 如果按下回车，并且编辑器高度比 body 大的时候，跳到底部 */
			if (
				e.keyCode === 13 &&
				(document.body.scrollHeight - document.body.offsetHeihgt) >= document.body.scrollTop - 100
			) {
				//window.scrollTo(document.body, scrollh);
			}
		} else {
			fill.innerText = textarea.value;
		}
		/* 多加 32，这样不会在末行按回车的时候闪烁了 */
		textarea.style.height = fill.offsetHeight + 32 + 'px';
	}
	resize(e={}){
		this.emit('resize', e, this);
		setTimeout(() => {
			this.resizeHandle(this.textAreaContain, this.fillContain, e)
		}, 17);
	}
	use(textarea, fill){
		this.textAreaContain = textarea;
		this.fillContain = fill;

		this.eventList.forEach(eventName => {
			textarea.addEventListener(eventName, e => {
				setTimeout(this.resize.bind(this), 17, e)
			}, true)
		});

		setTimeout(this.resize.bind(this), 100)
	}
}
AutoTextArea.prototype.eventList = [/*'keypress',*/ 'keydown', 'focus', 'click', 'change'];

class PamEditorCategoryCompoent {
	regCategoryPlugin(){
		/*
		this.extendsArticleProperty.category = (article) => {

		};
		*/
		this.applyArticleProperty.push(article => {
			this.loadCategory(article.category)
		})
	}
	loadCategory(category){
		console.info('category:', category)
	}
	setCategoryContainer(ele = $$('.category-frame', this.contain)){
		this.categoryContain = ele;
	}
	categoryStart(){
		this.setCategoryContainer();
		this.regCategoryPlugin();
	}
	constructor(){
		this.start();
		this.plugin();
		this.tagStart();
		this.categoryStart();
		this.setButton();
	}
}

class PamEditorTagManager extends PamEditorCategoryCompoent {
	clearTag(){
		this.tags.splice(0);
		$$('.tag-list', this.tagContain).innerHTML = '';
	}
	loadTag(tagArray){
		this.hasOwnProperty('tagContain') || this.setTagContain();

		this.clearTag();

		tagArray.forEach(this.addTag.bind(this));
	}
	addTag(tag){
		if (this.tags.includes(tag)) {
			return this.emit('same-tag', tag);
		}
		this.tags.push(tag);
		let tagItem = document.createElement('div');
		tagItem.textContent = tag;

		tagItem.onclick = e => {
			this.tags.splice(this.tags.indexOf(tag), 1);
			tagItem.parentNode.removeChild(tagItem);
		};

		$$('.tag-list', this.tagContain).appendChild(tagItem);

		this.emit('inter-add-tag', tag);
	}
	setTagContain(ele = $$('.tag', this.contain)){
		this.tagContain = ele;
		const lthis = this;
		$$('.tag-new', this.tagContain).onsubmit = function (e) {
			if (this.tag.value.length) {
				lthis.addTag(this.tag.value)
			}
			this.tag.value = '';
			return false;
		};
		return ele;
	}
	tagChange(){
		this.emit('tag-change', this.tags);
	}
	tagStart(){
		this.tags = [];

		this.setTagContain();
		this.on('inter-add-tag', (tag) => {
			this.emit('add-tag', tag)
				.emit('inter-tag-change');
		});
		this.on('inter-tag-change', this.tagChange.bind(this));
	}
	setButton(){
		this.actionElement = {};
		this.actionStatus = {};

		$('.editor-panel > *', this.contain).forEach(ele => {
			const actName = ele.getAttribute('p-action');
			if (actName === null || actName.length === 0) {
				throw new Error('editor action is not empt');
			}
			const status = {};
			this.actionElement[actName] = ele;
			this.actionStatus[actName] = status;
			ele.onclick = e => {
				this.emit(`action-${actName}`, status, e);
			};
		});
	}
}
class PamPlugin extends PamEditorTagManager {
	plugin(){
		this.extendsArticleProperty = {
			content(article){ return $$('[name="content"]', this.contain).value },
			title(article){ return $$('[name="title"]', this.contain).value },
			tags(article){ return [...this.tags] },
		};
		this.applyArticleProperty = [
			article => { $$('[name="content"]', this.contain).value = article.content },
			article => { $$('[name="title"]', this.contain).value = article.title },
			article => { this.loadTag(article.tags) }
		];
	}
	fetchGetPlugin(obj = {}){
		Object.keys(this.extendsArticleProperty).forEach(key => {
			obj[key] = this.extendsArticleProperty[key].call(this, obj)
		});
		return obj;
	}
}
class PamEditor extends PamPlugin {
	show(){
		this.emit('editor-show');

		this.contain.style.display = '';
		setTimeout(() => {
			this.contain.style.opacity = 1;
			this.contain.style.top = '0px';
		}, 32);
		this.opened = true;
	}
	hide(){
		this.emit('editor-hide');

		this.contain.style.top = '16px';
		this.contain.style.opacity = 0;
		setTimeout(() => this.contain.style.display = 'none', 618);
		this.opened = false;
	}

	collect(){ return this.fetchGetPlugin() }
	apply(article){
		const result = this.applyArticleProperty.map(processor => processor(article))
		this.autoText.resize();
		return result;
	}
	start(ele = $$('.editor'), hide = true){
		this.contain = ele;
		CORE.setStyle('style/pam-editor.css');

		hide && this.hide();

		window.addEventListener('keydown', e => {
			if (e.keyCode === 27 && this.opened) {
				this.hide();
			}
		})

		this.autoText = new AutoTextArea;
		this.autoText.use(
			$$('[name="content"]', ele),
			$$('.height-fill', ele)
		)
	}
}
PamEventEmitter.use(PamEditor.prototype);
