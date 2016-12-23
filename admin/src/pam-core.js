class PamModel extends PamEventEmitter {
	JsonRouter(str){
		let obj = JSON.parse(str);
		if (typeof(obj) === 'object' && isNaN(Number(obj.code))) {
			throw new Error('错误的返回码')
		}
		return obj;
	}
	auth(){
		
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

const CORE = new Pam;
CORE.start();
