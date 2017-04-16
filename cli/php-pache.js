const supertest = require('supertest')
const vools = require('../tools/vools')
const PamEventEmitter = require('../tools/pam-event')
const Model = require('../model')


class PaccheArticleData {
  async saveAllArticles() {
    return Promise.all(this.articles.map(article => article.save()))
  }

  replaceCategory(oldCate, newCate, articles = this.articles) {
    return articles.filter(art => {

      if (art.category === oldCate._id.toString()) {
        art.category = newCate._id.toString()
        return true
      }
    })
  }

  async saveAllCategories() {
    const saved = await Model.Category.find().sort({ 'sort': 1 })

    const categories = [];
    for (let categoryName in this.categories) {
      let category = this.categories[categoryName]
      let replace_result = await Model.Category.findOne({name: categoryName})
      if (replace_result) {
        this.replaceCategory(category, replace_result)
      } else {
        categories.push(category)
      }
    }

    return Promise.all(categories.map(cate => cate.save()))
  }

  async saveAll() {
    return {
      categories: await this.saveAllCategories(),
      articles: await this.saveAllArticles(),
    }
  }
  constructor({categories, articles}) {
    this.categories = categories
    this.articles = articles
  }
}

class Construct {
  constructor(opt) {
    if (!opt.url) {
      throw new Error('url 參數未指定')
    }
    if (!opt.pw) {
      throw new Error('pw 參數未指定')
    }

    this.records = []
    this.opt = opt
    this.limit = 999999999
    this.ap = supertest(opt.url)
  }
}

Construct.prototype.__proto__ = Object.create(PamEventEmitter.prototype)

class MongoStore extends Construct {

}

class SyncData extends MongoStore {
  async getListData() {
    const url = `/admin/ad.php?` + vools.stringifyRequest({
      pw: this.opt.pw,
      type: 'getindex',
      display: 'json',
      page: this.page || 1,
      limit: this.limit,
    })
    const web = await this.ap.get(url)

    const result = JSON.parse(web.text)
    if (undefined !== result.code && 0 !== result.code) {
      if ('pw' === result.str) throw new Error('密碼錯誤')
      else throw new Error(`錯誤：${result.str}`)
    }

    return result
  }
  async syncData() {
    const listData = await this.getListData()
    const summary = listData.articles.map(article => {
      article.tags = listData.articlesTagList[article.id]
      return article
    })
    this.records = []
    for (let art_sum of summary) {
      let web = await this.ap.get(`/get.php?id=${art_sum.id}&display=json`)
      const article = JSON.parse(web.text)

      this.records.push(article)
      this.emit('push-article', article)
    }
    return this.records
  }
}

class Convert extends SyncData {
  convert() {
    if (!this.records.length) {
      throw new Error('記錄為空，請確認是否同步')
    }
    const categories = {}
    const converted = []

    for (let article of this.records) {
      if (!categories[article.class] && article.class.length) {
        categories[article.class] = new Model.Category({ name: article.class })
      }

      let is_repost = false
      let {title} = article
      if (/^\[转\]/.test(title)) {
        is_repost = true
        title = title.replace(/^\[转\]/, '').trim()
      }
      let tags = []
      article.tag.forEach(tag => {
        if ('轉載' === tag || '转载' === tag) {
          is_repost = true
        } else {
          tags.push(tag)
        }
      })

      const newArticle = new Model.Article({
        category: article.class.length ? categories[article.class]._id.toString() : null,
        title,
        content: article.article,
        contentType: article.type,
        is_repost,
        mod: article.ltime,
        date: article.time,
        tags,
      })

      converted.push(newArticle)
    }

    return new PaccheArticleData({ categories, articles: converted })
  }
}

class Pache extends Convert {}

module.exports = Pache
