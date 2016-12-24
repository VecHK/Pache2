class PamPage {
	setContain(){
		this.cotain($$('.page'));
	}
	setProperty(){
		/* 定义当前页 */
		Object.defineProperty(this, 'page', {
			get(){},
			set(){}
		});

		/* 定义最大页 */
		this.maxPage = 0;
	}
	start(){
		this.setContain();
		this.setProperty();
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
	/* 获取已选项目 */
	collectCheckedItem(){
		return $('[type="checkbox"]', this.contain)
			.map((check, cursor) => check.checked && this[cursor])
			.filter((item, cursor) => item);
	}
	/* 部署 checkbox 系列事件 */
	setCheckbox(checkboxEle, ev){
		let changeOffset = -1;
		const checkedMap = $('[type="checkbox"]', this.contain).map((check, cursor) => {
			if (check === checkboxEle) { changeOffset = cursor }
			return check.checked;
		})
		this.emit('check-change', changeOffset, checkedMap);

		if (checkedMap.includes(true)) {
			this.emit('has-checked');
		} else {
			this.emit('no-checked');
		}
	}
	renderList(){
		this.contain.innerHTML = '';
		this.forEach(articleItem => {
			const li = document.createElement('li');
			li.classList.add('list-item');
			li.innerHTML = `
				<input type="checkbox" name="id" value="${articleItem._id}" />
				<div class="link">
					<div p-action="title" class="item-title"></div>
					<ul class="item-tags"></ul>
				</div>
			`;
			{//checkbox
				const lthis = this;
				$$('[type="checkbox"]', li).addEventListener('click', function (e) {
					lthis.setCheckbox(this, e);
				});
			}

			{//title
				$$('.item-title', li).textContent = articleItem.title;

				$$('.item-title', li).addEventListener('click', e => {
					this.emit('title-click', articleItem);
				});
			}

			{//tag
				const tagContain = $$('.item-tags', li);
				articleItem.tags.forEach(tagItem => {
					let li = document.createElement('li');
					li.classList.add('tag');
					li.textContent = tagItem;

					tagContain.appendChild(li);
					li.addEventListener('click', e => this.emit('tag-click', tagItem));
				});
			}

			this.contain.appendChild(li);
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
