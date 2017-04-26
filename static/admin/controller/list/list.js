define(function (require) {
  const [$, $$] = require('/vools.js')
  const envir = require('src/envir.js')
  const PageCode = require('controller/list/pagecode.js')
  const Categories = require('model/category.js')
  const EventModel = require('/pam-event.js')

  const EventModelMirror = Object.assign({}, EventModel)
  EventModelMirror.__proto__ = Array.prototype

  const List = Object.create(EventModelMirror)

  Object.assign(List, {
    empty(){

    },
    setContain(){
      this.watting = setStyle('style/pam-list.css');
      this.contain = $$('.list');
    },
    renderEmpty(){
      this.contain.innerHTML = '还没有文章<a href="/">创建文章</a>';
      $$('a', this.contain).onclick = e => {
        this.emit('create', e);
        return false;
      };
    },
    /* 获取已选项目 */
    collectCheckedItem(){
      return $('[type="checkbox"]', this.contain)
        .map((check, cursor) => check.checked && this[cursor])
        .filter((item, cursor) => item);
    },
    /* 部署 checkbox 系列事件 */
    setCheckbox(checkboxEle, ev){
      let changeOffset = -1;
      const checkedMap = $('[type="checkbox"]', this.contain).map((check, cursor) => {
        if (check === checkboxEle) { changeOffset = cursor }
        return check.checked;
      })
      this.emit('check-change', changeOffset, checkedMap);

      if (checkedMap.includes(true)) {
        this.emit('has-checked');
      } else {
        this.emit('no-checked');
      }
    },
    renderList(){
      this.contain.innerHTML = '';
      this.forEach(articleItem => {
        const li = document.createElement('li');
        li.classList.add('list-item');
        li.innerHTML = `
          <input type="checkbox" name="id" value="${articleItem._id}" />
          <div class="link">
            <div p-action="title" class="item-title"></div>
            <div class="meta-box">
              <span class="item-is-draft">${articleItem.is_draft ? '✎' : ''}</span>
              <span class="item-category"></span>
              <ul class="item-tags"></ul>
            </div>
          </div>
        `;
        {//checkbox
          const lthis = this;
          $$('[type="checkbox"]', li).addEventListener('click', function (e) {
            lthis.setCheckbox(this, e);
          });
        }

        {//title
          $$('.item-title', li).textContent = articleItem.title;

          $$('.item-title', li).addEventListener('click', e => {
            this.emit('title-click', articleItem);
          });

          $(li).css({
            'border-left': `solid 4px ${articleItem.fusion_color}`
          });
        }

        {//category
          const category_container = $$('.item-category', li);
          const current_category = Categories.getById(articleItem.category);
          if (current_category) {
            $(category_container).text(current_category.name)
          } else {
            $(category_container).text('')
          }
        }

        {//tag
          const tagContain = $$('.item-tags', li);
          articleItem.tags.forEach(tagItem => {
            let li = document.createElement('li');
            li.classList.add('tag');
            li.textContent = tagItem;

            tagContain.appendChild(li);
            li.addEventListener('click', e => this.emit('tag-click', tagItem));
          });
        }

        this.contain.appendChild(li);
      });
    },
    render(list){
      if (!this.hasOwnProperty('contain')) {
        this.start();
      }
      this.splice(0);
      this.push(...list);

      if (list.length) {
        this.renderList();
      } else {
        this.renderEmpty();
      }
      this.renderAfter()
    },
    renderAfter() {
      this.emit('render')
    },
    start() {
      this.setContain();
    },
  })

  List.start()

  return List
})
