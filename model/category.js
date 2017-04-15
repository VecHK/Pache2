const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

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

CategorySchema.pre('update', function (next) {
	const _id = this._conditions._id.toString();
	let set = this._update.$set;
	if (set.name && (cateUtils.checkName(set.name))) {
		const err = new Error('name is not undefined, null, or toString method is not function')
		err.status = 500;
		return next(err);
	}

	// console.warn('namenamenamename', set.name)
	if (set.name) {
		/* name 有无重复 */
		CategoryModel.findOne({name: set.name})
			.then(info => {
				if (info) {
					if (info._id.toString() === _id) {
						return Promise.resolve()
					} else {
						let err = new Error(`repeat category(${set.name})`);
						throw err
					}
				}
			})
			.then(() => next())
			.catch(err => next(err))
	} else {
		next()
	}
})
CategorySchema.pre('save', function (next) {
	/* name 检查 */
	if (typeof(this.name) === 'undefined' || cateUtils.checkName(this.name)) {
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
		.catch(err => next(err))
});

const CategoryModel = mongoose.model('Category', CategorySchema);
