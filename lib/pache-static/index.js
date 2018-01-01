const path = require('path')
const send = require('koa-send')
const fs = require('mz/fs')

module.exports = serve

const defaultValue = (source, def) => {
  Object.keys(def).forEach(key => {
    if (!source.hasOwnProperty(key)) {
      source[key] = def[key]
    }
  })
}

function serve(opt = {}) {
  defaultValue(opt, {
    enable_modified_cache: true,
  })

  const SERVE_PATH = opt.path

  let transfer

  if (opt.enable_modified_cache) {
    transfer = async (ctx, filePath, stat = fs.stat(filePath)) => {
      const {dir, base} = path.parse(filePath)

      const mod_time = (await stat).mtime.toGMTString()
      const {header} = ctx.request
      const modProp = 'if-modified-since'
      if (header[modProp] && (header[modProp] === mod_time)) {
        ctx.status = 304
      } else {
        ctx.response.set('Last-Modified', mod_time)
        return await send(ctx, base, { root: dir })
      }
    }
  } else {
    transfer = async (ctx, filePath) => {
      const {dir, base} = path.parse(filePath)
      return await send(ctx, base, { root: dir })
    }
  }

  return async (ctx, next) => {

    const url_path = path.normalize(decodeURIComponent(ctx.path))

    const filePath = path.join(SERVE_PATH, url_path)
    const {dir, base} = path.parse(filePath)

    // console.warn('ctx.path:', ctx.path)
    // console.warn('SERVE_PATH:', SERVE_PATH)
    // console.warn('filePath:', filePath)
    // console.warn('url_path:', url_path)
    // console.warn('dir, base', dir, base)

    if (!await fs.exists(filePath)) {
      return await next()
    }

    const stat = await fs.stat(filePath)

    if (stat.isDirectory()) {
      return await next()
    } else {
      return await transfer(ctx, filePath, stat)
    }
  }
}
