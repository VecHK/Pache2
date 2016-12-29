const model = require('../model');
const envir = require('../envir');

Object.assign(exports, {
	del(ids){
		if (!Array.isArray(ids)) {
			return new Promise((resolve, reject) => reject(new Error('ids is no Array')));
		}

		return model.Article.find({ _id: {$in: ids}}).remove();
	},
	throwNoId(){
		throw new Error('need id')
	},
	mod(id = this.throwNoId(), article){
		if (Array.isArray(article) || article === null || typeof(article) !== 'object') {
			return new Promise((resolve, reject) => reject(new Error('article must be a Object')));
		}

		return model.Article.update({_id: id}, {$set: article})
	},
	insert({title, content, contentType, tags}){
		let article = new model.Article({
			title,
			content,
			contentType,
			tags,
		});
		return article.save();
	},

	count(tags = []){
		return model.Article.find(tags.length && { tags: {$all: tags} })
			.count().exec();
	},
	getlist(page, tags, dateSort = -1){
		let start = (page - 1) * envir.limit;
		if (!Number.isInteger(page) || page < 1) {
			return Promise.reject(new Error('page must be Integer and greater or equal to 1'));
		}
		let conditions = {};
		if (Array.isArray(tags) && tags.length) {
			conditions.tags = {$all: tags};
		} else if (Array.isArray(tags)) {
			conditions.tags = [];
		}
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

	get(id = this.throwNoId()){
		return model.Article.findOne({_id: id}).exec();
	},
})
