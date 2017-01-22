const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
	value: {  },
	name: { type: String },
	sort: { type: Number, default: 0 },
	type: { type: String, default: 'category' },
});

CategorySchema.pre('save', function (next) {
	/* name 检查 */
	if ((typeof(this.name) !== 'string') || !this.name.length) {
		const err = new Error('name is not String, or is an empty String')
		err.status = 500;
		throw err;
	}
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
