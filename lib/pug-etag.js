const path = require('path')
const DirModSign = require('./dir-mod-sign')

const view_path = path.join(__dirname, '../views')
const pugETag = new DirModSign(view_path)

const refresh_handle = () => {
  pugETag.ETag = String(pugETag.sign)
}
pugETag.on('refresh-sign', refresh_handle)
refresh_handle()

module.exports = pugETag
