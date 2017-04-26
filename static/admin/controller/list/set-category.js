define(function (require) {
  const [$, $$] = require('/vools.js')
  const envir = require('src/envir.js')
  const Article = require('model/article.js')
  const List = require('controller/list/list.js')
  const TopButton = require('controller/top-panel.js')
  const PageCode = require('controller/list/pagecode.js')
  const CategoryModel = require('model/category.js')

  setStyle('style/set-category.css')
  const container = document.createElement('div')
  $(container).class('category-selector').css('display', 'none')
  container.innerHTML = `
    <ul class="categories-list">
      <li>N/A 1</li>
      <li>N/A 2</li>
    </ul>
    <button class="clear">取消分類</button>
  `
  $(document.body).append(container)

  const button = TopButton.getElement('set-category')
  const hideButton = () => $(button).css('display', 'none')
  const showButton = () => $(button).css('display', '')

  const hideSelector = () => $(container).css('display', 'none')
  const showSelector = () => $(container).css('display', '')

  List.on('has-checked', showButton)
  List.on('no-checked', () => {
    hideButton()
    hideSelector()
  })

  TopButton.click('set-category', async () => {
    const parent = button.offsetParent
    showSelector().css({
      display: '',
      width: `${button.offsetWidth}px`,
      left: `${parent.offsetLeft + button.offsetLeft}px`,
      top: `${parent.offsetTop + button.offsetTop}px`,
    })
    hideButton()

    await new Promise(r => setTimeout(r, 20))

    let clicked = false
    const setClicked = function () {
      clicked = true
      this.removeEventListener('click', setClicked)
    }
    $$(container).addEventListener('click', setClicked)

    const checkClicked = function () {
      if (!clicked) {
        hideSelector()
        showButton()
      }
      this.removeEventListener('click', checkClicked)
    }
    $$(document).addEventListener('click', checkClicked)
  })

  async function setArticlesCategory(category_value) {
    $(container).css('display', 'none')
    const checked_item = List.collectCheckedItem()
    const ids = checked_item.map(item => item._id)

    ids.length || console.warn('ids 為空')

    await Article.patchFields(ids, {
      category: category_value,
    })
  }

  function renderCategoryItem() {
    const records = CategoryModel.records
    const $ul = $('.categories-list', container)
    $ul.html('')

    records.forEach(cate => {
      if (cate.type !== 'category') {
        return
      }
      const li = document.createElement('li')
      $(li).text(cate.name)

      li.addEventListener('click', async e => {
        await setArticlesCategory(cate._id)
        List.render(await Article.list(PageCode.page))
      })

      $ul.append(li)
    })
  }
  CategoryModel.isEmited('records-refresh', renderCategoryItem)
  CategoryModel.on('records-refresh', renderCategoryItem)

  $$('.clear', container).addEventListener('click', async e => {
    await setArticlesCategory(null)
    List.render(await Article.list(PageCode.page))
  })

  return {}
})
