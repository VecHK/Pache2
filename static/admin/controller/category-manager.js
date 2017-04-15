define(function (require) {
  const [$, $$] = require('/vools.js')
  const Categories = require('model/category.js')
  const TopButton = require('controller/top-panel.js')

  const Manager = {};

  const STATUS = {
    window_is_open: false,
  };
  const manager_ele = $$('.categories-manager')
  const list_ele = $$('.categories-list', manager_ele)

  setStyle('style/categories-manager.css')

  Categories.refresh()
  Categories.on('records-refresh', (records) => {
    render(records)
  })

  TopButton.on('p-command-categories', function () {
    STATUS.window_is_open = !STATUS.window_is_open

    if (STATUS.window_is_open) {
      manager_ele.style.display = 'block'
    } else {
      manager_ele.style.display = 'none'
    }
  });

  const CategoryElement = {
    submit(categoryContext, e) {
      // 用這種方式能判斷是否是新建的分類
      if (categoryContext._id) {
        return CORE.patchCategory(categoryContext._id, categoryContext)
      } else {
        return CORE.createCategory(categoryContext)
      }
    },
    create(category){
      const li = document.createElement('li')
      li.classList.add('categories-item')
      // li.classList.add('create-category-form')
      $(li).html(`
        <form>
          <input type="text" name="color" placeholder="顏色代碼" value="${category.color || ''}" />
          <input type="text" name="name" class="name" placeholder="輸入新的分類名" value="${category.name || ''}" />
          ${category._id ? '<div class="delete">刪除</div>' : ''}
          <button style="display:none"></button>
        </form>
      `)
      let self = this
      const form = $$('form', li)
      form.addEventListener('submit', function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        category.name = form.name.value;
        category.color = form.color.value;

        category.save()
        .then(() => Categories.refresh())
        .catch(e => { console.error(e); throw e })
      })

      let delete_button = $$('.delete', li)
      delete_button && delete_button.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        category.remove()
        // CORE.delCategory(category._id)
        // .then(() => CORE.freshCategories())
        .catch(e => { console.error(e); throw e})
      })

      return li;
    },
  };

  function render(categories) {
    list_ele.innerHTML = '';
    categories.forEach(category => {
      const ele = CategoryElement.create(category)
      list_ele.appendChild(ele)
    })
    const cate = Categories.init({name: '', color: ''})
    const category_form = CategoryElement.create(cate)
    list_ele.appendChild(category_form)
  }

  return {}
})
