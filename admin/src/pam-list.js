class PamPage extends PamEventEmitter {
	/* 当前页码，总页码 */
	set(page){
		let countPage = this.maxPage;
		const toCenter = Math.floor(this.length / 2);
		let cursor = page - toCenter,
			right = page + toCenter;

		if (cursor <= 0){
			right += Math.abs(cursor) + 1;
			cursor = 1;
		}

		if (right > countPage){
			cursor -= Math.abs(right - countPage);
			if (cursor <= 0){
				cursor = 1;
			}
			right = countPage;
		}

		let codeEle = $('div', this.contain);
		let eleCursor = 0;

		for (; cursor<=right; ++cursor){
			if (page === cursor){
				codeEle[eleCursor].classList.add('current-pagecode');
			} else {
				codeEle[eleCursor].classList.remove('current-pagecode');
			}
			codeEle[eleCursor].innerText = cursor;
			++eleCursor;
		}
	}
	initCodeElement(){
		this.length = 5;
		this.contain.innerHTML = '';
		for (let i=0; i<this.length; i++) {
			this.contain.innerHTML += `<div></div>`;
		}
		$('div', this.contain).forEach((ele, cursor) => {
			ele.addEventListener('click', e => {
				let page = Number(ele.innerText);
				this.set(page)
				this.emit('click', page);
			});
		});
	}
	setContain(){
		this.contain = $$('.page');
		this.initCodeElement();
	}
	setProperty(){
		/* 定义当前页 */
		Object.defineProperty(this, 'page', {
			get(){},
			set(){}
		});

		let maxPage;
		Object.defineProperty(this, 'maxPage', {
			get(){ return maxPage },
			set(value){
				$('div', this.contain).forEach((ele, cursor) => {
					ele.innerText = '';
				});
				maxPage = value;
			}
		});
		this.maxPage = 50;
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
PamEventEmitter.use(PamList.prototype);
