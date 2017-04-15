class PamArticleProfile extends PamEventEmitter {
	show(){
		this.contain.style.display = 'block'
		setTimeout(() => {
			this.contain.style.left = '1em';
			this.contain.style.opacity = 1;
			this.opened = true;
		}, 32);
	}
	hide(){
		this.contain.style.left = '0px';
		this.contain.style.opacity = 0;
		setTimeout(() => {
			this.contain.style.display = 'none';
		}, 382);
		this.opened = false;
	}
	getContentType(selectEle = $$('.content-type', this.contain)){
		return selectEle.children[ selectEle.selectedIndex ].value;
	}
	setContentType(typeName, selectEle = $$('.content-type', this.contain)){
		selectEle.value = typeName.toLowerCase();
		if (!selectEle.value.length) {
			console.warn(`不支持的文章类型: ${typeName}`);
			selectEle.value = selectEle.children[0].value;
		}
	}
	use(editor){
		this.editor = editor;

		editor.on('action-profile', () => {
			this[Boolean(this.opened) ? 'hide' : 'show']()
		});

		this.on('ok', this.hide.bind(this));

		$$('.profile-ok', this.contain).addEventListener('click', e => this.emit('ok', e))

		editor.extendsArticleProperty.contentType = (article) => {
			return this.getContentType();
		};
		editor.applyArticleProperty.push(article => {
			this.setContentType(article.contentType);
		});
	}
	setContain(ele = $$('.article-profile'), hide = true){
		this.contain = ele;

		if (hide) {
			this.hide();
		}

		CORE.setStyle('style/pam-article-profile.css');
	}
	start(){
		this.setContain();
	}
}
