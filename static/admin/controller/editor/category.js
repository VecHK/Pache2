define(function (require) {
  const [$, $$] = require('/vools.js')
  const Editor = require('controller/editor/editor.js')
  const EditorAction = require('controller/editor/action.js')
  const Categories = require('model/category.js')

  const button = $$('.editor-panel > .category', Editor.container)
  const current_category = $$('.category span', Editor.container)
  const setting_box = $$('.editor-panel > .category .set-article-category', Editor.container)
  const select_list = $$('.category-list', Editor.container)
  const create_category_form = $$('.category-new', setting_box)
  const STATUS = {
    current_category: null,
  }

  /* 禁用事件冒泡 */
  setting_box.addEventListener('click', e => e.stopImmediatePropagation())

  let button_active = false
  const checkActive = function () {
    setting_box.classList[button_active ? 'add' : 'remove']('show')
  }
  EditorAction.click('set-category', e => {
    button_active = !button_active
    checkActive()
  })
  Editor.addProperty('category', function () {
    if (STATUS.current_category) {
      return STATUS.current_category._id
    } else {
      return null
    }
  })

  Editor.addApplyQuery('category', function (article_category) {
    $(current_category).text('')
    const checked = Categories.records.find(category => category._id === article_category)
    STATUS.current_category = checked
    if (checked) {
      $(current_category).text(checked.name)
    }
  })

  if (Categories.records.length) {
    renderCategoriesSelectList()
  }
  Categories.on('records-refresh', () => {
    renderCategoriesSelectList()
  })

  function renderCategoriesSelectList() {
    select_list.innerHTML = ''
    Categories.records.forEach(category => {
      if (category.type !== 'category') {
        return
      }
      const li = document.createElement('li')
      li.appendChild(document.createTextNode(category.name))
      li.onclick = e => {
        STATUS.current_category = category
        $(current_category).text(category.name)
      };

      select_list.appendChild(li)
    })
  }

  const createCategory = async function () {
    Categories.init({ name: this.category.value })

    const result = await Categories.save()
    console.warn(result)
  };
  create_category_form.addEventListener('submit', function (e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    createCategory.call(this)
  })
})
