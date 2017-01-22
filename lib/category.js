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
	getByName(name){ categoryModel.findOne({name}) }
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
		/* 这边就是默认操作 */
		let promise = TypeMiddle(name).category();

		return new Proxy(promise, {
			/* 如果 get 方法执行了，那就表示后面接了点运算符（点号.） */
			get(target, key, receiver){
				if (key === 'as') {
					return TypeMiddle(name);
				}
				return target[key].bind(target)
			}
		})
	},
	getByName(name){
		return method.getByName(name)
	},
};

module.exports = category;
