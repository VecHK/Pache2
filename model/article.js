const jsdom = require( 'jsdom' );
const cheerio = require('cheerio');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

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
	let $ = cheerio.load(this.format);
	$($('.page')[0]).addClass('current-page').addClass('solid-page');

	//應該需要轉義的
	//this.format = entities.decode($.html())

	this.format = $.html();

	/* 取出腳註 */
	$ = cheerio.load(this.format);
	let footnotesHTML = $('section.footnotes').html();
	if ($('section.footnotes').length) {
		$('section.footnotes').remove();
		this.format = $.html() + `\n<section class="footnotes">${footnotesHTML}</section>`;
	}

};

ArticleSchema.pre('save', function (next) {
	contentFormat.apply(this);

	this.tags = this.tags.filter(tag => tag.length)

	next();
});

ArticleSchema.pre('update', function (next) {
	let set = this._update.$set;
	if (set.hasOwnProperty('tags') && !Array.isArray(set.tags)) {
		set.tags = [ set.tags ];
	}
	if (Array.isArray(set.tags)) {
		set.tags = set.tags.filter(tag => tag.length)
	}

	set.mod = new Date;

	this.findOne({_id: this._conditions._id}).exec()
		.then(result => {
			if (result === null) {
				const err = new Error('article no found');
				err.status = 404;
				throw err
			}
			/* 如果有 content 项，则同时需要显式地声明了 contentType 项 */
			else if (set.hasOwnProperty('content') && set.hasOwnProperty('contentType')) {
				contentFormat.apply(set);
			} else if (set.hasOwnProperty('contentType')) {
				set.content = result.content;
				contentFormat.apply(set);
			} else {
				delete set.contentType;
				delete set.content;
			}
			next();
		})
		.catch(err => { next(err) })
});

mongoose.model('Article', ArticleSchema);
