define(function (require) {
  const [$, $$] = require('/vools.js');
  const envir = require('src/envir.js')
  const EnvirModel = require('/pam-event.js');

  const Code = {};
  Code.__proto__ = Object.create(EnvirModel);
  Object.assign(Code, {
    refresh() {
      this.set(this.page)
    },
    /* 当前页码，总页码 */
    set(page = this.page) {
      if (page > this.maxPage) {
        console.warn(`set 的頁碼(${page})大於所設定的 maxPage(${this.maxPage})，set 的頁碼已重置為 ${this.maxPage}`)
        return this.set(this.maxPage)
      }
      this.page = page;

      let countPage = this.maxPage;
      const toCenter = Math.floor(this.length / 2);
      let cursor = page - toCenter,
        right = page + toCenter;

      if (cursor <= 0){
        right += Math.abs(cursor) + 1;
        cursor = 1;
      }

      if (right > countPage){
        cursor -= Math.abs(right - countPage);
        if (cursor <= 0){
          cursor = 1;
        }
        right = countPage;
      }

      let codeEle = $('div', this.contain);
      let eleCursor = 0;

      for (; cursor<=right; ++cursor){
        if (page === cursor){
          codeEle[eleCursor].classList.add('current-pagecode');
        } else {
          codeEle[eleCursor].classList.remove('current-pagecode');
        }
        codeEle[eleCursor].innerText = cursor;
        ++eleCursor;
      }

      this.emit('page-change', page)
    },
    initCodeElement(){
      this.length = 5;
      this.contain.innerHTML = '';
      for (let i=0; i<this.length; i++) {
        this.contain.innerHTML += `<div></div>`;
      }
      $('div', this.contain).forEach((ele, cursor) => {
        ele.addEventListener('click', e => {
          let page = Number(ele.innerText);
          this.set(page)
          this.emit('click', page);
        });
      });
    },
    setContain(){
      this.contain = $$('.page');
      this.initCodeElement();
    },
    setProperty(){
      let maxPage;
      Object.defineProperty(this, 'maxPage', {
        get(){ return maxPage },
        set(value){
          $('div', this.contain).forEach((ele, cursor) => {
            ele.innerText = '';
          });
          maxPage = value;

          this.set()
        }
      });
      this.maxPage = 50;
    },
  });
  Code.watting = new Promise(resolve => {
    Code.setContain()
    Code.setProperty()
  })

  return Code;
})
