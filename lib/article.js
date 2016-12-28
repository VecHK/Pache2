const model = require('../model');
const envir = require('../envir');

Object.assign(exports, {
	del(ids){
		if (!Array.isArray(ids)) {
			return new Promise((resolve, reject) => reject(new Error('ids is no an Array')));
		}

		return model.Article.find({ _id: {$in: ids}}).remove();
	},
	mod(id, article){
		if (Array.isArray(article) || typeof(article) !== 'object') {
			return new Promise((resolve, reject) => reject(new Error('article is undefined')));
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
		return model.Article.find({ tags: {$in: tags} })
			.count().exec();
	},

	getlist(start, tags=[], dateSort=-1){
		let page = (start - 1) * envir.limit;
		return model.Article.find({ tags: {$in: tags}})
			.sort({date: dateSort})
			.skip(page)
			.limit(envir.limit || 10)
			.exec();
	},

	topic(){
		return model.Article.findOne()
			.sort({date: -1})
			.exec();
	},

	get(id){
		return model.Article.findOne({_id: id}).exec();
	},
})
