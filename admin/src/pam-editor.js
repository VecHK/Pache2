var textAreaResize = function (textarea, fill) {
	fill.innerText = textarea.value;
	textarea.style.height = fill.offsetHeight + 'px';
};

var textareaAutoHeight = function (textarea, fill) {
	var tThis = this;
	var resize = function (e) {
		textAreaResize(textarea, fill);
	};

	[/*'keypress',*/ 'keydown', 'focus', 'click'].forEach(function (eventName) {
		textarea.addEventListener(eventName, function (e) {
			setTimeout(resize, 32);
			return true;
		}, true);
	});
	setTimeout(resize, 100);
	return resize;
};

class PamEditorTagManager {
	loadTag(tagArray){
		this.hasOwnProperty('tagContain') || this.setTagContain();

		$$('.tag-list', this.tagContain).innerHTML = '';
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
		console.warn(this);
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
				this.emit(`action-${actName}`, e);
			};
		});
	}
	constructor(){
		this.start();
		this.tagStart();
		this.setButton();
	}
}
class PamEditor extends PamEditorTagManager {
	start(ele = $$('.editor'), hide = true){
		this.contain = ele;
		CORE.setStyle('style/pam-editor.css');
		if (!hide) {
			ele.style.display = 'none'
		}

		textareaAutoHeight(
			$$('[name="content"]', ele),
			$$('.height-fill', ele)
		);
	}
}
PamEventEmitter.bind(PamEditor.prototype);
