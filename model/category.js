const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
	分類的類型應該有三種：
		普通分類

		鏈接分類
			指向某個鏈接（鏈接 URI 存在 value 中），也可以是某篇文章

*/

const CategorySchema = new Schema({
	value: {  },
	name: { type: String },
	sort: { type: Number, default: 0 },
	type: { type: String, default: 'category' },
	color: { type: String, default: '#999' },
});

const cateUtils = {
	checkName(name) {
		return name === null || typeof(name.toString) !== 'function'
	}
};

const mhook = require('./async-middle-hook')

CategorySchema.pre('update', mhook(async function () {
	const _id = this._conditions._id.toString()
	let set = this._update.$set
	if (set.name && (cateUtils.checkName(set.name))) {
		const err = new Error('name is not undefined, null, or toString method is not function')
		throw err
	}

	if (set.name) {
		/* name 有无重复 */
		const info = await CategoryModel.findOne({name: set.name})
		if (info && info._id.toString() !== _id) {
			let err = new Error(`repeat category(${set.name})`);
			throw err
		}
	}
}))

CategorySchema.pre('save', mhook(async function () {
	/* name 检查 */
	if (typeof(this.name) === 'undefined' || cateUtils.checkName(this.name)) {
		const err = new Error('name is not undefined, null, or toString method is not function')
		throw err;
	}
	let str = this.name.toString()
	if ((typeof(str) !== 'string') || !str.length) {
		const err = new Error('toString() \'s value is not String, or is an empty String')
		throw err;
	}
	this.name = str;

	/* name 有无重复 */
	const info = await CategoryModel.findOne({name: this.name})
	if (typeof(info) === 'object' && info !== null) {
		let err = new Error(`repeat category(${this.name})`);
		throw err
	}
	const topic = await CategoryModel.findOne().sort({'sort': -1})
	if (topic === null) {
		this.sort = 0;
	} else {
		this.sort = topic.sort + 1;
	}
}));

const CategoryModel = mongoose.model('Category', CategorySchema);
