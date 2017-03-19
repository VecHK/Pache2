class PamModel extends PamEventEmitter {
	JsonRouter(str){
		let obj = JSON.parse(str);
		if (typeof(obj) === 'object' && isNaN(Number(obj.code))) {
			throw new Error('錯誤的返回對象')
		}
		if (obj.code) {
			throw new Error(`錯誤的返回碼(${obj.code})`)
		}
		return obj;
	}
	auth(){

	}

	/* 登出 */
	logout(){
		return $.get('logout')
			.then(res => {
				this.emit('logout', this.JsonRouter(res));
			})
			.catch(err => {
				this.emit('error', err)
				throw err
			})
	}

	setCategory(set) {

	}
	delCategory(id) {
		if (!id) {
			return Promise.reject('刪除時未指定 id')
		}
		return $.delete(`api/category/${id}`)
		.then(res => {
			this.emit('category-deleted', this.JsonRouter(res), id)
		})
		.catch(err => {
			this.emit('error', err)
			throw err
		})
	}
	patchCategory(id, category_obj) {
		const patchObj = {}
		const {name, color} = category_obj
		if (name) patchObj.name = name
		if (color) patchObj.color = color

		return $.patch(`api/category/${id}`, patchObj)
			.then(res => {
				console.info(res)
				console.warn(category_obj)
				this.emit('category-patched', this.JsonRouter(res), category_obj)
			})
			.catch(err => {
				this.emit('error', err)
				throw err
			})
	}
	createCategory(category_obj) {
		return $.post('api/category', category_obj)
			.then(res => {
				this.emit('category-created', this.JsonRouter(res))
			})
			.catch(err => {
				this.emit('error', err)
				throw err
			})
	}
	getCategories() {
		return $.get('api/categories')
		.then(res => Promise.resolve(this.JsonRouter(res)))
		.catch(err => {
			this.emit('error', err)
			throw err
		})
	}
	freshCategories() {
		this.getCategories().then(res => {
			this.categories = res.result
			this.emit('categories-fresh', res)
		})
	}

	/* 批量删除文章 */
	removeArticle(ids){
		return $.delete(`api/articles`, {ids})
			.then(res => {
				this.emit('articles-deleted', this.JsonRouter(res));
			})
			.catch(err => {
				this.emit('error', err)
				throw err
			})
	}
	modArticle(id, article){
		return $.patch(`api/article/${id}`, article)
			.then(res => {
				this.emit('article-modified', this.JsonRouter(res));
			})
			.catch(err => {
				this.emit('error', err)
				throw err
			})
	}
	insertArticle(article){
		return $.post(`api/article`, article)
			.then(res => {
				this.emit('article-created', this.JsonRouter(res));
			})
			.catch(err => {
				this.emit('error', err)
				throw err
			})
	}
	getArticles(page=1){
		return $.get(`api/articles/${page}`)
			.then(res => {
				this.emit('get-articles', this.JsonRouter(res));
			})
			.catch(err => {
				this.emit('error', err);
				throw err;
			})
	}
}
class Pam extends PamModel {
	setStyle(href){
		const styleEle = document.createElement('link');
		styleEle.rel = 'stylesheet';
		styleEle.href = href;
		$$('body').appendChild(styleEle);
	}


	start(){
		this.article = {
			title: '',
			content: '',
		};

		this.page = this.pageList.Normal;
	}
}
Object.assign(Pam.prototype, {
	pageList: {
		Normal: Symbol('normal'),
	},
	page: 0,
});
