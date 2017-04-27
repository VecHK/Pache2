define(function (require) {
  const EventModel = require('/pam-event.js')
  const [$, $$] = require('/vools.js')
  const EditorAction = require('controller/editor/action.js')
  const Profile = Object.create(EventModel)

  const timeout = ms => new Promise(r => setTimeout(r, ms))

  console.warn(EditorAction)

  // Layer
  Object.assign(Profile, {
    async show() {
      const {container} = this
      const $con = $(this.container)
      $con.css({ display: 'block' })

      await timeout(32)

      $con.css({
        opacity: 1,
        left: '1em',
      })
      this.opened = true
    },
    async hide() {
      const $con = $(this.container)
      $con.css({
        opacity: 0,
        left: '0px',
      })

      await timeout(382)

      $con.css({ display: 'none' })
      this.opened = false
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
    _profile: {},
    addSetting(prop_name) {
      const {_profile} = this
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
