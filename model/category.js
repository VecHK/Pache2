const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const CategorySchema = new Schema({
	value: {  },
	name: { type: String },
	sort: { type: Number, default: 0 },
	type: { type: String, default: 'category' },
});

CategorySchema.pre('save', function (next) {
	/* name 检查 */
	if (typeof(this.name) === 'undefined' || this.name === null || typeof(this.name.toString) !== 'function') {
		const err = new Error('name is not undefined, null, or toString method is not function')
		err.status = 500;
		return next(err);
	}
	let str = this.name.toString()
	if ((typeof(str) !== 'string') || !str.length) {
		const err = new Error('toString() \'s value is not String, or is an empty String')
		err.status = 500;
		return next(err);
	}
	this.name = str;

	/* name 有无重复 */
	CategoryModel.findOne({name: this.name})
		.then(info => {
			if (typeof(info) === 'object' && info !== null) {
				let err = new Error(`repeat category(${this.name})`);
				throw err
			}
		})
		.then(() => CategoryModel.findOne().sort({'sort': -1}))
		.then(topic => {
			if (topic === null) {
				this.sort = 0;
			} else {
				this.sort = topic.sort + 1;
			}
			next();
		})
		//.then(() => next())
		.catch(err => next(err))
});

const CategoryModel = mongoose.model('Category', CategorySchema);
