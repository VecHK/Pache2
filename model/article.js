const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* 过滤 HTML 标签 */
const striptags = require('striptags');

/* 转义 HTML 实体字符 */
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities;

/* markdown */
const MarkdownIt = require('markdown-it');

const md = MarkdownIt()
	.use(require('markdown-it-footnote'))


const ArticleSchema = new Schema({
	status: { type: Number, default: 0 },

	title: { type: String, default: '(title)' },
	content: { type: String, default: '(empty)' },
	contentType: { type: String, default: 'text' },
	format: { type: String, default: '(format)' },
	tags: { type: Array, default: [] },

	date: { type: Date, default: Date.now },
	mod: { type: Date, default: Date.now },

});

ArticleSchema.pre('save', function (next) {
	if (this.contentType === 'markdown') {
		this.format = md.render(this.content);
	} else {
		/* 转 Text */
		this.format = `<pre><code>${entities.encode(this.content)}</code></pre>`;
	}

	let now = new Date;
	this.mod = now;

	next();
});

mongoose.model('Article', ArticleSchema);
