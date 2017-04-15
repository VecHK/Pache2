define(function (require) {
  const [$, $$] = require('/vools.js')
  const EventModel = require('/pam-event.js')
  const Editor = require('controller/editor/editor.js')

  const Tags = {
    clearTag() {
      this.tags.splice(0)
      $$('.tag-list', this.tagContain).innerHTML = ''
    },
    loadTag(tagArray) {
      this.hasOwnProperty('tagContain') || this.setTagContain()

      this.clearTag()

      tagArray.forEach(this.addTag.bind(this))
    },
    addTag(tag) {
      if (this.tags.includes(tag)) {
        return this.emit('same-tag', tag)
      }
      this.tags.push(tag)
      let tagItem = document.createElement('div')
      tagItem.textContent = tag

      tagItem.onclick = e => {
        this.tags.splice(this.tags.indexOf(tag), 1)
        tagItem.parentNode.removeChild(tagItem)
      }

      $$('.tag-list', this.tagContain).appendChild(tagItem)

      this.emit('inter-add-tag', tag)
    },
    setTagContain(ele = $$('.tag', Editor.container)) {
      this.tagContain = ele
      const self = this
      $$('.tag-new', this.tagContain).onsubmit = function (e) {
        if (this.tag.value.length) {
          self.addTag(this.tag.value)
        }
        this.tag.value = ''
        return false
      }
      return ele
    },
    tagChange() {
      this.emit('tag-change', this.tags)
    },
    tagStart() {
      this.tags = []

      this.setTagContain()
      this.on('inter-add-tag', (tag) => {
        this.emit('add-tag', tag)
        this.emit('inter-tag-change')
      })
      this.on('inter-tag-change', this.tagChange.bind(this))
    },
    setButton() {
      this.actionElement = {}
      this.actionStatus = {}

      $('.editor-panel > *', Editor.container).forEach(ele => {
        const actName = ele.getAttribute('p-action')
        if (actName === null || actName.length === 0) {
          throw new Error('editor action is not empt')
        }
        const status = {}
        this.actionElement[actName] = ele
        this.actionStatus[actName] = status
        ele.onclick = e => {
          this.emit(`action-${actName}`, status, e)
        }
      })
    },
  }
  Tags.__proto__ = Object.create(EventModel)

  Editor.addProperty('tags', function () {
    return [...Tags.tags]
  })
  Editor.addApplyQuery('tags', function (tags) {
    Tags.loadTag(tags)
  })

  Tags.tagStart()
  Tags.setButton()
})
