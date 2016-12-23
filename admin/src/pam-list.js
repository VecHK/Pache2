class PamPage {
	setContain(){
		this.cotain($$('.page'));
	}
	start(){
		this.setContain();
	}
}

class PamList extends Array {
	empty(){

	}
	setContain(){
		CORE.setStyle('style/pam-list.css');
		this.contain = $$('.list');
	}
	renderEmpty(){
		this.contain.innerHTML = '还没有文章<a href="/">创建文章</a>';
		$$('a', this.contain).onclick = e => {
			this.emit('create', e);
			return false;
		};
	}
	renderList(){
		this.contain.innerHTML = '';
		this.forEach((item) => {
			item += 'div'
		});
	}
	render(list){
		if (!this.hasOwnProperty('contain')) {
			this.start();
		}
		this.splice(0);
		this.push(...list);

		if (list.length) {
			return this.renderList();
		} else {
			return this.renderEmpty();
		}
	}
	start(){
		this.setContain();
	}
}
PamEventEmitter.bind(PamList.prototype);
