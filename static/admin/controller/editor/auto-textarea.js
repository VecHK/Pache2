define(function (require) {
  const EventModel = require('/pam-event.js')
  const AutoTextArea = Object.create(EventModel)
  Object.assign(AutoTextArea, {
    resizeHandle(textarea, fill, e={}) {
      /* pre 有个奇怪的问题，它的 textContent 末尾如果只有个 \n 话它是不会增高的，故要加个空格进去 */
      if (textarea.value[textarea.value.length - 1] === '\n') {
        fill.textContent = textarea.value + ' ';

        /* 如果按下回车，并且编辑器高度比 body 大的时候，跳到底部 */
        if (
          e.keyCode === 13 &&
          (document.body.scrollHeight - document.body.offsetHeihgt) >= document.body.scrollTop - 100
        ) {
          //window.scrollTo(document.body, scrollh);
        }
      } else {
        fill.innerText = textarea.value;
      }
      /* 多加 32，这样不会在末行按回车的时候闪烁了 */
      textarea.style.height = fill.offsetHeight + 32 + 'px';
    },
    resize(e={}) {
      this.emit('resize', e, this);
      setTimeout(() => {
        this.resizeHandle(this.textAreaContain, this.fillContain, e)
      }, 17);
    },
    use(textarea, fill) {
      this.textAreaContain = textarea;
      this.fillContain = fill;

      this.eventList.forEach(eventName => {
        textarea.addEventListener(eventName, e => {
          setTimeout(this.resize.bind(this), 17, e)
        }, true)
      });

      setTimeout(this.resize.bind(this), 100)
    },

    eventList: [/*'keypress',*/ 'keydown', 'focus', 'click', 'change']
  })

  return AutoTextArea
})
