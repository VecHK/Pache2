const model = require('../model');
const envir = require('../envir');

Object.assign(exports, {
	insert({title, content, contentType, tags}){
		let article = new model.Article({
			title,
			content,
			contentType,
			tags,
		});
		return article.save();
	},

	count(){
		return model.Article.find().count().exec();
	},

	getlist(start, dateSort=-1){
		return model.Article.find()
			.sort({date: dateSort})
			.skip(start)
			.limit(envir.limit || 10)
			.exec();
	},

	topic(){
		return model.Article.findOne()
			.sort({date: -1})
			.exec();
	},

	getById(){},
})
