const redis = require('redis')
const supertest = require('supertest')
const envir = require('../envir')
const agent = supertest(`http://127.0.0.1:${envir.port}`)
const client = redis.createClient({
  // db: 'pache_db',
})

client.flushdb()

const Model = require('../model')

async function clearHkey() {
  // console.log(cli.hkeyPool)
  for (let key in cli.hkeyPool) {
    if (/^list-/.test(key)) {
      let path = (await cli.HMGET(key, 'path')).pop()

      await cli.del(key)

      if (path) await agent.get(path)
    }
  }
}
Model.on('category-change', async function () {
  await clearHkey()
})

const cli = {
  client,

  checkHkeyPool(hkey) {
    const pool = this.hkeyPool
    if (!(hkey in pool)) {
      pool[hkey] = {}
    }
    return pool[hkey]
  },
  HMSET(hkey, obj) {
    this.checkHkeyPool(hkey)
    return new Promise((res, rej) => {
      client.HMSET(hkey, obj, function (err, result) {
        err ? rej(err) : res(result)
      })
    })
  },
  HMGET(hkey, key) {
    return new Promise((res, rej) => {
      client.HMGET(hkey, key, function (err, value) {
        err ? rej(err) : res(value)
      })
    })
  },
  del(key) {
    return new Promise((res, rej) => {
      client.del(key, (e, value) => e ? rej(e) : res(value))
    })
  },
  hkeyPool: {
  },
  createHomeCacheKey(pagecode, category_name, tags) {

  },
}

module.exports = cli
