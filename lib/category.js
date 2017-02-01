const model = require('../model');
const envir = require('../envir');

const categoryModel = model.Category;

const method = {
	add(name, type, value) {
		let category = new categoryModel({
			name,
			type,
			value,
		});
		return category.save();
	},
	getByName: name => categoryModel.findOne({ name }),
	getAll: name => categoryModel.find().sort({ 'sort': 1 }),
};

const TypeSET = {
	link: name => value => method.add(name, 'link', value),
	article: name => value => method.add(name, 'article', value),
	category: name => value => method.add(name, 'category', value),
};

TypeMiddle = function (name) {
	return new Proxy({}, {
		get(target, key) {
			return TypeSET[key](name)
		}
	})
};

const category = {
	set(name){
		return new Proxy({}, {
			/* 如果 get 方法执行了，那就表示后面接了点运算符（点号.） */
			get(target, key, receiver){
				if (key === 'as') {
					return TypeMiddle(name)
				}

				let defaultPromise = TypeMiddle(name).category()
				let fn = defaultPromise[key];
				if (typeof(fn) === 'function') {
					fn = fn.bind(defaultPromise)
				}
				return fn;
			}
		})
	},
	get(name){
		return method.getByName(name)
	},
	getAll: method.getAll,
};

module.exports = category;
