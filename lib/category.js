const model = require('../model');
const envir = require('../envir');

const CategoryModel = model.Category;

const libCategory = {
  del(ids) {
    if (!ids) {
      return Promise.reject(new Error('need id'))
    }
    if (!Array.isArray(ids)) {
      return Promise.reject(new Error('刪除時需要的是 id 數組'))
    }
    return CategoryModel.find({ _id: {$in: ids}}).remove()
  },
  mod(id, category){
    if (!id) {
      return Promise.reject(new Error('need id'));
    }

    if (Array.isArray(category) || category === null || typeof(category) !== 'object') {
      return new Promise((resolve, reject) => reject(new Error('category must be a Object')))
    }

    try {
      return CategoryModel.update({_id: id}, {$set: category})
    } catch (e) {
      return Promise.reject(e);
    }
  },
  create({name, type, value, color}) {
    const category = new CategoryModel({
      name,
      type,
      value,
      color,
    });
    return category.save();
  },
  getByName(name) {
    return CategoryModel.findOne({ name });
  },
  getAll() {
    return CategoryModel.find().sort({ 'sort': 1 });
  },
};

module.exports = libCategory;
