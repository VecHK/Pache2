const Collect = require('collect-info')

const SelectForm = new Collect([
	{ name: 'answer',
		prompt: '*** 注意，這是實驗性的功能，你確定要執行刷新命令嗎？（输入 "yes" 继续）',
		type: String,
	}
]);

module.exports = async function () {
  let obj = await SelectForm.start()

  if (obj.answer.toLowerCase() === 'yes') {
    console.info('開始刷新')

    try {
      const model = require('../model')
      await model.refreshContent((article, cursor, all_article) => {
        console.log(`[${cursor + 1} / ${all_article.length}] ${article._id} - ${article.title}`)
      })
      console.info('刷新完成')
    } catch (e) {
      console.error('出錯：', err)
      process.exit(-1)
    }
  } else {
    console.info('取消刷新命令')
  }

  process.exit(0)
};
