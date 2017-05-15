const envir = require('../envir');
const jsdom = require( 'jsdom' );
const cheerio = require('cheerio');
const Cutl = require('../tools/color-utils.js');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoryModel = mongoose.model('Category');

const mhook = require('./async-middle-hook')

/* 过滤 HTML 标签 */
const striptags = require('striptags');

/* 转义 HTML 实体字符 */
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities;

/* markdown */
const MarkdownIt = require('markdown-it');

const hljs = require('highlight.js');

const md = MarkdownIt({
	html: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre class="hljs source-code"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
			} catch (__) {}
		}

		return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
	}
})
.use(require('markdown-it-footnote'))


const ObjectId = mongoose.Schema.Types.ObjectId;

const ArticleSchema = new Schema({
	status: { type: Number, default: 0 },

	title: { type: String, default: '(title)' },
	content: { type: String, default: '(empty)' },
	contentType: { type: String, default: 'text' },
	format: { type: String, default: '(format)' },
	tags: { type: Array, default: [] },

	date: { type: Date, default: Date.now },
	mod: { type: Date, default: Date.now },

	repost: { type: Object, default: null },
	category: { type: String, default: null },
	is_draft: { type: Boolean, default: false },
	is_repost: { type: Boolean, default: false },
	link_symbol: { type: String, default: null },
	fusion_color: { type: String, default: '#CCC' },
});

const repost_color = Cutl.init(envir.repost_color || '#46c01b');
const repost_color_middle = async function (opts) {
	let {is_repost, category, set, source} = opts
	if (!set) { set = source }
	if (is_repost === undefined) {
		is_repost = ('is_repost' in set) ? set.is_repost : source.is_repost
	}
	if (category === undefined) {
		category = await CategoryModel.findOne({
			_id: ('category' in set) ? set.category : source.category
		})
	} else if (typeof(category) === 'string') {
		category = await CategoryModel.findOne({ _id: category })
	}

	if (is_repost && category === null) {
		// 無分類的轉載文章
		set.fusion_color = repost_color.getColorCode()
	} else if (!is_repost && category === null) {
		// 無分類的非轉載文章
		set.fusion_color = '#CCC'
	} else if (category && is_repost) {
		// 有分類的轉載文章
		const c_color = Cutl.init(category.color)
		const f_color = Cutl.or(c_color, repost_color)
		set.fusion_color = f_color.getColorCode()
	} else if (category && !is_repost) {
		// 有分類的非轉載文章
		set.fusion_color = category.color
	}
}

const contentFormat = function () {
	this.contentType = this.contentType.toLowerCase();

	if (this.contentType === 'markdown') {
		this.format = md.render(this.content);
	} else if (this.contentType === 'text') {
		this.format = `<pre class="text-type"><code>${entities.encode(this.content)}</code></pre>`;
	} else if (this.contentType === 'html') {
		this.format = this.content;
	} else {
		this.format = 'unknown contentType';
	}

	/* 分頁處理 */
	const splited = this.format.split(`<div class="split-page"></div>`);
	this.format = splited.map(eleHTML => `<div class="page">${eleHTML}</div>`).join('\n');

	/* 將首頁固定 */
	let $ = cheerio.load(this.format, {
		decodeEntities: envir.markdown_entitles ? true : false,
	});
	$($('.page')[0]).addClass('current-page').addClass('solid-page');

	/* 取出腳註 */
	let footnotesHTML = $('section.footnotes').html();
	if ($('section.footnotes').length) {
		$('section.footnotes').remove();
		this.format = $.html() + `\n<section class="footnotes">${footnotesHTML}</section>`
	} else {
		this.format = $.html()
	}
};

ArticleSchema.pre('save', mhook(async function () {
	contentFormat.apply(this)

	this.tags = this.tags.filter(tag => tag.length)

	if (this.category === 'null') {
		this.category = null
	}

	await repost_color_middle({ source: this })
}));

ArticleSchema.pre('update', mhook(async function () {
	let set = this._update.$set
	if (!set) {
		return
	}

	if (set.hasOwnProperty('tags') && !Array.isArray(set.tags)) {
		set.tags = [ set.tags ]
	}
	if (Array.isArray(set.tags)) {
		set.tags = set.tags.filter(tag => tag.length)
	}

	if (set.category === 'null') {
		set.category = null
	}

	set.mod = new Date

	let result_list = await this.find({_id: this._conditions._id})
	for (let result of result_list) {
		if (result === null) {
			const err = new Error('article no found')
			err.status = 404
			throw err
		} else if (set.hasOwnProperty('content') && set.hasOwnProperty('contentType')) {
			/* 如果有 content 项，则同时需要显式地声明了 contentType 项 */
			contentFormat.apply(set)
		} else if (set.hasOwnProperty('contentType')) {
			set.content = result.content
			contentFormat.apply(set)
		} else {
			delete set.contentType
			delete set.content
		}

		const opt = { source: result }
		if ('category' in set) {
			opt.category = set.category
			delete set.fusion_color
		}
		if ('is_repost' in set) {
			opt.is_repost = set.is_repost
			delete set.fusion_color
		}
		await repost_color_middle(opt)

		Object.assign(result, set)

		await result.save()
	}
}));

mongoose.model('Article', ArticleSchema)
