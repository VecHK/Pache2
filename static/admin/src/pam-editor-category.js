(function (global, document, editor) {
  const button = $$('.editor-panel > .category', editor.contain)
  const current_category = $$('.category span', editor.contain)
  const setting_box = $$('.editor-panel > .category .set-article-category', editor.contain)
  const select_list = $$('.category-list', editor.contain)
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
  editor.on('action-set-category', e => {
    button_active = !button_active
    checkActive()
  })
  editor.extendsArticleProperty.category = function (article) {
    if (STATUS.current_category) {
      return STATUS.current_category._id
    } else {
      return null
    }
  }

  editor.applyArticleProperty.push(article => {
    $(current_category).text('')
    const checked = CORE.categories.find(category => category._id === article.category)
    STATUS.current_category = checked
    if (checked) {
      $(current_category).text(checked.name)
    }
  })

  CORE.on('categories-fresh', () => {
    renderCategoriesSelectList()
  })

  function renderCategoriesSelectList() {
    select_list.innerHTML = ''
    CORE.categories.forEach(category => {
      const li = document.createElement('li')
      li.appendChild(document.createTextNode(category.name))
      li.onclick = e => {
        STATUS.current_category = category
        $(current_category).text(category.name)
      };

      select_list.appendChild(li)
    })
  }

  const createCategory = function () {
    CORE.createCategory({ name: this.category.value })
    .then(result => {
      console.warn(result)
    })
  };
  create_category_form.addEventListener('submit', function (e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    createCategory.call(this)
  })
})(window, window.document, editor)
