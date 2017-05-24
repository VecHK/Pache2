const netStatus = (() => ObjectAssign(Object.create(EventLite), {
  __processMiddle: [
    function setConnection() {
      let connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection || navigator.MozConnection || navigator.msConnection

      if (connection) {
        connection.addEventListener('typechange', e => {
          const {type} = connection

          this.emit('change', type)
          this.emit(`change-to-${type}`, connection)
          this.emit('limit-change', this.isLimit())
        })
      } else {
        console.warn('不支持 navigator.connection, 將採取默認措施')
        this.connection = null
      }

      this.supportConnection = Boolean(connection)
      this.connection = connection
    },
    function setOnline() {
      this.isOnline = function () { return navigator.onLine }
      const changeHandle = e => {
        const lineStatus = this.isOnline()
        if (lineStatus) {
          this.emit('online')
        } else {
          this.emit('offline')
        }
        this.emit('line-change', lineStatus)
      }
      window.addEventListener('online', changeHandle)
      window.addEventListener('offline', changeHandle)
    },
    function () {

    }
  ],
  isLimit() {
    if (!this.isOnline()) {
      return false
    } else if (!this.supportConnection) {
      return false
    } else {
      const type = this.connection.type
      switch(type) {
        case 'bluetooth':
        case 'ethernet':
        case 'wifi':
        case 'wimax':
        case 'other':
        case 'unknown':
          return false

        case 'cellular':
        case 'none':
          return true
      }
    }
  },
  init() {
    this.__processMiddle.forEach(fn => fn.apply(this))
    return this
  },
}).init())()
