
class Pam {
	setStyle(href){
		const styleEle = document.createElement('link');
		styleEle.rel = 'stylesheet';
		styleEle.href = href;
		$$('body').appendChild(styleEle);
	}

	getArticles(){
		return new Promise((resolve, reject) => {

		});
	}
	constructor(){
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
});

const CORE = new Pam;
