
const fs = require('fs')
const EventEmitter = require('events')
const PacheEvent = require('pache-event')
const fetchDir = require('./fetch-dir')

class ModSign {
  'refreshSign' () {
    this.sign = Date.now()
    this.emit('refresh-sign', this.sign, this)
  }

  'regWatch' (tree = this.tree) {
    tree.forEach(child => {
      if (child.child) {
        return this.regWatch(child.child)
      } else {
        fs.watchFile(child.path, (current, previous) => {
          this.refreshSign()
        })
      }
    })
  }

  constructor (dir) {
    if (fs.statSync(dir).isDirectory()) {
      this.tree = fetchDir(dir)
    } else {
      throw new Error('指定的路径不是一个目录')
    }

    this.refreshSign()

    this.regWatch()
  }
}

ModSign.prototype.__proto__ = PacheEvent.create()

module.exports = ModSign
