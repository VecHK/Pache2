const Model = require('../model');
const fs = require('fs');

async function getPacheCollection() {
	return {
		categories: await Model.Category.find().sort({ 'sort': 1 }),
		articles: await Model.Article.find().sort({date: -1})
	}
}

module.exports = async function (filepath = 'pache-article-export.json') {
	console.log('開始收集文章數據');
	const collection = await getPacheCollection();
	console.info(`完成，總文章數：${collection.articles.length}，分類：${collection.categories.map(cate => cate.name)}`)
	console.log(`開始存入 ${filepath}`)
	fs.writeFileSync(filepath, JSON.stringify(collection, 1, '\t'));
	console.log('完成')
	process.exit(0)
}
