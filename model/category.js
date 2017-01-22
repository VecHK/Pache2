const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
	name: { type: String },
	type: { type: String, default: 'category' },
	value: {  },
});

CategorySchema.pre('save', function (next) {
	/* name 检查 */
	if ((typeof(this.name) !== 'string') || !this.name.length) {
		const err = new Error('name is not String, or is an empty String')
		err.status = 500;
		throw err;
	}
	/* name 有无重复 */
	//console.info(this.__proto__.findOne);
	CategoryModel.findOne({name: this.name})
		.then(info => {
			if (typeof(info) === 'object' && info !== null) {
				let err = new Error(`repeat category(${this.name})`);
				throw err
			} else {
				next()
			}
		})
		.catch(err => next(err))
});

const CategoryModel = mongoose.model('Category', CategorySchema);
