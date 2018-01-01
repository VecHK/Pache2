const DirModSign = require('./dir-mod-sign')

const pugETag = new DirModSign('views')

const refresh_handle = () => {
  pugETag.ETag = String(pugETag.sign)
}
pugETag.on('refresh-sign', refresh_handle)
refresh_handle()

module.exports = pugETag
