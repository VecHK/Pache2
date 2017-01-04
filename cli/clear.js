const Collect = require('collect-info');
const model = require('../model');

const SelectForm = new Collect([
	{ name: 'answer',
		prompt: '*** 你确定真的要执行清空命令吗？（输入 "yes" 继续）',
		type: String,
	}
]);

module.exports = function () {
	return SelectForm.start()
		.then((obj) => {
			if (obj.answer.toLowerCase() === 'yes') {
				return model.removeCollection('articles')
			} else {
				return Promise.resolve()
			}
		})
		.then(result => {
			if (result === true) {
				console.info('删除成功！')
			} else {
				console.log('文章未删除', result)
			}
		})
		.catch(err => { console.error(err, '文章没有删除成功，之前没有创建过文章也会有这种问题'); throw err })
};
