define(function (require) {
  const EventModel = require('/pam-event.js')
  const [$, $$] = require('/vools.js')
  const EditorAction = require('controller/editor/action.js')
  const Profile = Object.create(EventModel)

  console.warn(EditorAction)

  // Layer
  Object.assign(Profile, {
    show() {
      this.container.style.display = 'block'
      setTimeout(() => {
        this.container.style.left = '1em';
        this.container.style.opacity = 1;
        this.opened = true;
      }, 32);
    },
    hide() {
      this.container.style.left = '0px';
      this.container.style.opacity = 0;
      setTimeout(() => {
        this.container.style.display = 'none';
      }, 382);
      this.opened = false;
    },
  })
  Object.assign(Profile, {
    getContentType(selectEle = $$('.content-type', this.container)){
      return selectEle.children[ selectEle.selectedIndex ].value;
    },
    setContentType(typeName, selectEle = $$('.content-type', this.container)){
      selectEle.value = typeName.toLowerCase();
      if (!selectEle.value.length) {
        console.warn(`不支持的文章类型: ${typeName}`);
        selectEle.value = selectEle.children[0].value;
      }
    },
    use(editor){
      this.editor = editor;

      EditorAction.on('p-action-profile', () => {
        this[Boolean(this.opened) ? 'hide' : 'show']()
      })

      this.on('ok', this.hide.bind(this));

      $$('.profile-ok', this.container).addEventListener('click', e => this.emit('ok', e))

      const draft_checkbox = $('[name="is_draft"]')[0]

      let that = this
      editor.addProperty({
        contentType: function () {
          return that.getContentType()
        },
        is_draft: function () {
          return draft_checkbox.checked
        },
      })
      editor.addApplyQuery({
        contentType: function (contentType) {
          that.setContentType(contentType)
        },
        is_draft: function (is_draft) {
          draft_checkbox.checked = is_draft || false
        },
      })
    },
    setContainer(ele = $$('.article-profile'), hide = true){
      this.container = ele;

      if (hide) {
        this.hide();
      }

      setStyle('style/pam-article-profile.css');
    },
    start(){
      this.setContainer();
    },
  })
  Profile.start()
  Profile.use(require('controller/editor/editor.js'))

  return Profile
})
