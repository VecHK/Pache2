const libArticle = require('../lib/article');
const fs = require('fs');

module.exports = function (filepath) {
	filepath = filepath || 'pache-article-export.json';

	console.log('开始获取文章数据');

	return libArticle.getAll()
		.then(collection => {
			console.log('完成，总文章数：', collection.length)
			fs.writeFileSync(filepath, JSON.stringify(collection, 1, '\t'));
			console.log('已存入：', filepath);
		})
		.catch(err => { console.error(err); throw err })
};
