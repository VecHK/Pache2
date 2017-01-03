const model = require('../model');
const envir = require('../envir');

Object.assign(exports, {
	del(ids){
		if (!Array.isArray(ids)) {
			ids = [ ids ];
		}
		return model.Article.find({ _id: {$in: ids}}).remove().exec();
	},
	mod(id, article){
		if (!id) {
			return Promise.reject(new Error('need id'));
		}
		if (Array.isArray(article) || article === null || typeof(article) !== 'object') {
			return new Promise((resolve, reject) => reject(new Error('article must be a Object')));
		}

		try {
			return model.Article.update({_id: id}, {$set: article})
		} catch (e) {
			return Promise.reject(e);
		}
	},
	INVALID_DATE_STRING: (new Date({})).toString(),
	isInvalidDate(date){
		return (date instanceof Date) && date.toString() === this.INVALID_DATE_STRING;
	},
	insert(articleObj){
		if (Array.isArray(articleObj) || typeof(articleObj) !== 'object' || articleObj === null) {
			return Promise.reject(new Error('article must be Object'))
		}

		let {title, content, contentType, tags, mod, date} = articleObj;

		let saveObj = {
			title,
			content,
			contentType,
			tags,
		};
		if (!this.isInvalidDate(mod)) {
			saveObj.mod = mod;
		}
		if (!this.isInvalidDate(date)) {
			saveObj.date = date;
		}
		let article = new model.Article(saveObj);
		return article.save();
	},
	_createTagsConditions(tags){
		const conditions = {};

		if (Array.isArray(tags) && tags.length) {
			conditions.tags = {$all: tags};
		} else if (Array.isArray(tags)) {
			conditions.tags = [];
		}

		return conditions;
	},
	count(tags){
		let conditions = this._createTagsConditions(tags);

		return model.Article.find(conditions)
			.count().exec();
	},
	getlist(page, tags, dateSort = -1){
		let start = (page - 1) * envir.limit;
		if (!Number.isInteger(page) || page < 1) {
			return Promise.reject(new Error('page must be Integer and greater or equal to 1'));
		}
		let conditions = this._createTagsConditions(tags);

		return model.Article.find(conditions)
			.sort({date: dateSort})
			.skip(start)
			.limit(envir.limit)
			.exec();
	},

	topic(){
		return model.Article.findOne()
			.sort({date: -1})
			.exec();
	},

	get(id){
		if (!id) {
			const err = new Error('need id');
			err.status = 400;
			return Promise.reject(err);
		} else {
			return model.Article.findOne({_id: id}).exec();
		}
	},
})
