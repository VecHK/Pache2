/*
  分類管理器
  TODO 分類類型選擇器
  TODO 顏色選擇器
  TODO 值選擇器
*/
define(function (require) {
  const [$, $$] = require('/vools.js')
  const Categories = require('model/category.js')
  const TopButton = require('controller/top-panel.js')

  const Manager = {};

  const STATUS = {
    window_is_open: false,
  };
  const manager_ele = $$('.categories-manager')

  setStyle('style/categories-manager.css')

  Categories.refresh()
  Categories.on('records-refresh', (records) => {
    renderPatch(records)
  })

  TopButton.on('p-command-categories', function () {
    STATUS.window_is_open = !STATUS.window_is_open

    if (STATUS.window_is_open) {
      manager_ele.style.display = 'block'
    } else {
      manager_ele.style.display = 'none'
    }
  });

  const Submiter = require('controller/category-manager/submiter.js')

  const list_ele = $$('.categories-list', manager_ele)
  function renderPatch(categories) {
    $(list_ele).html('')
    categories.forEach(cate => {
      const li = document.createElement('li')
      console.warn(Submiter)
      const submiter = Submiter.init(li, cate)
      $(list_ele).append(li)
    })
  }

  const Creator = require('controller/category-manager/creator.js')
  const creator = Creator.init($$('.creator', manager_ele))

  return {}
})
