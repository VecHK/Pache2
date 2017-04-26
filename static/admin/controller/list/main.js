define(function (require) {
  const Article = require('model/article.js');

  (async function () {

    const List = require('controller/list/list.js');
    await List.watting;

    const PageCode = require('controller/list/pagecode.js');
    PageCode.on('page-change', async page_code => {
      let article_list = await Article.list(page_code)
      List.render(article_list)
    })
    Article.on('countPage-change', countPage => {
      PageCode.maxPage = countPage
    })

    PageCode.set(1)

    const draft = require('controller/list/draft.js')
    const del = require('controller/list/delete.js')
    const repost = require('controller/list/repost.js')
    const new_post = require('controller/list/new-post.js')
    const setCategory = require('controller/list/set-category.js')
    const logout = require('controller/list/logout.js')

  })()
})
