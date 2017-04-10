define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')
  const List = require('controller/list/list.js')
  const EditorAction = require('controller/editor/action.js')
  const Editor = Object.create(EventModel)

  setStyle('style/pam-editor.css')
  setStyle('style/pam-article-profile.css')

  const AutoTextArea = require('controller/editor/auto-textarea.js')

  // Layer
  Object.assign(Editor, {
    show() {
      this.emit('editor-show');

      this.container.style.display = '';
      setTimeout(() => {
        this.container.style.opacity = 1;
        this.container.style.top = '0px';
      }, 32);
      this.opened = true;
    },
    hide() {
      this.emit('editor-hide');

      this.container.style.top = '16px';
      this.container.style.opacity = 0;
      setTimeout(() => this.container.style.display = 'none', 618);
      this.opened = false;
    },
  })

  // frame
  Object.assign(Editor, {
    editorProperty: {},
    // 添加屬性
    addProperty(name, cb) {
      if (typeof(name) === 'object') {
        Object.assign(this.editorProperty, name)
      } else {
        this.editorProperty[name] = cb
      }
    },
    // 收集屬性
    collect() {
      const data = {}
      const property = this.editorProperty

      for (let key in property) {
        data[key] = property[key]()
      }

      return data
    },

    // 屬性應用隊列
    applyQuery: {},
    addApplyQuery(name, cb) {
      if (typeof(name) === 'string') {
        const applyQuery = this.applyQuery
        if (!Array.isArray(applyQuery[name])) {
          applyQuery[name] = []
        }
        return applyQuery[name].push(cb)
      } else {
        for (let key in name) {
          this.addApplyQuery(key, name[key])
        }
      }
    },
    apply(article) {
      this.article = article
      for (let key in this.applyQuery) {
        this.applyQuery[key].forEach(fn => fn(article[key]))
      }
      // this.emit('apply', article)
      this.autoText.resize()
    },
  })

  // base
  Object.assign(Editor, {
    start(ele = $$('.editor'), hide = true) {
      this.container = ele;

      hide && this.hide();

      window.addEventListener('keydown', e => {
        if (e.keyCode === 27 && this.opened) {
          this.hide();
        }
      })

      this.autoText = AutoTextArea;
      this.autoText.use(
        $$('[name="content"]', ele),
        $$('.height-fill', ele)
      )
    },
  })

  Editor.addProperty({
    title: function () {
      return $$('[name="title"]', Editor.container).value
    },
    content: function () {
      return $$('[name="content"]', Editor.container).value
    },
  })
  Editor.addApplyQuery({
    title: function (title) {
      $$('[name="title"]', Editor.container).value = title
    },
    content: function (content) {
      $$('[name="content"]', Editor.container).value = content
    },
  })

  EditorAction.on('p-action-submit', async function () {
    let article = Editor.collect()

    Object.assign(Editor.article, article)

    let result = await Editor.article.save()
    Editor.emit('submited', result)
  })

  Editor.start()
  List.on('title-click', article => {
    // console.warn(article)
    Editor.apply(article)

    Editor.show()
  })

  window.Editor = Editor

  return Editor
})
