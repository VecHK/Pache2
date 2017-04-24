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
	fusion_color: { type: String, default: '#CCC' },
});

const repost_color = Cutl.init(envir.repost_color || '#46c01b');
const contentRepost = async function (source, set = source) {
	let category

	if (source.category !== null) {
		category = await CategoryModel.findOne({ _id: source.category })
	} else {
		category = null
	}

	// 無分類有轉載 轉載綠
	// 無分類非轉載 默認色
	// 有分類有轉載 【分類|轉載】融合色
	// 有分類非轉載 分類色
	if (!('is_repost' in set)) {
		return
	}

	if (category === null) {
		if (set.is_repost) {
			set.fusion_color = repost_color.getColorCode()
		} else {
			set.fusion_color = '#CCC'
		}
	} else if (set.is_repost) {
		const c_color = Cutl.init(category.color)
		const f_color = Cutl.or(c_color, repost_color)
		set.fusion_color = f_color.getColorCode()
	} else {
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
	contentFormat.apply(this);

	this.tags = this.tags.filter(tag => tag.length)

	if (this.category === 'null') {
		this.category = null
	}

	await contentRepost(this)
}));

ArticleSchema.pre('update', mhook(async function () {
	let set = this._update.$set;
	if (!set) {
		return
	}

	if (set.hasOwnProperty('tags') && !Array.isArray(set.tags)) {
		set.tags = [ set.tags ];
	}
	if (Array.isArray(set.tags)) {
		set.tags = set.tags.filter(tag => tag.length)
	}

	if (set.category === 'null') {
		set.category = null
	}

	set.mod = new Date;

	let result = await this.findOne({_id: this._conditions._id})

	if (result === null) {
		const err = new Error('article no found')
		err.status = 404;
		throw err
	} else if (set.hasOwnProperty('content') && set.hasOwnProperty('contentType')) {
		/* 如果有 content 项，则同时需要显式地声明了 contentType 项 */
		contentFormat.apply(set);
	} else if (set.hasOwnProperty('contentType')) {
		set.content = result.content;
		contentFormat.apply(set);
	} else {
		delete set.contentType;
		delete set.content;
	}

	await contentRepost(result, set)
}));

mongoose.model('Article', ArticleSchema);
