const express = require('express');
const envir = require('../../envir');
const libArticle = require('../../lib/article');
const libCategory = require('../../lib/category');
const router = express.Router();
module.exports = router;

//const has = (obj, ...keys) => keys.every(checkey => Object.keys(obj).some(objkey => objkey === checkey));

/* 文章页 */

router.get('/article/:articleid', (req, res, next) => {
	req.articleid = req.params.articleid;
	next();
});
router.get('/article/*', (req, res, next) => {
	libArticle.get(req.articleid)
		.then(article => {
			if (article === null) {
				return Promise.reject(new Error('article nofound'))
			}

			if (article.is_draft) {
				Object.assign(article, {
					title: '拒絕',
					format: `<div class="page current-page solid-page">
					<div></div>
					<p>你所訪問的這篇文章已經被設置為「草稿」狀態，Pache 不行不能不可以提供。</p>
					<p>
					你或許可以：
					<ul>
						<li>聯繫站長</li>
						<li>看看 WebArchive</li>
						<li>等到有生之年</li>
						<li>使用抽屜型時光機</li>
						<li>發動「リハイハル」或者是「<ruby>運命探知の魔眼<rt>Reading Steiner</rt></ruby>」</li>
						<li>取消收藏/書籤</li>
						<li>對站長實施人身鄙視（不建議）</li>
					</ul>
					</p>`+
					`<pre class="hljs source-code">\n`+
					`<code>文章的一些元數據\n`+
					`文章ＩＤ：${article._id.toString()}\n`+
					`文章標題：${article.title}\n`+
					`文章標籤：${article.tags}\n`+
					`分類ＩＤ：${article.category}\n`+
					`渲染類型：${article.contentType}\n`+
					`創建時間：${article.date.toISOString()}\n`+
					`修改時間：${article.date.toISOString()}\n`+
					`是否轉載：${article.is_repost ? '√' : '×'}\n`+
					`融合顏色：<span style="color: ${article.fusion_color}">${article.fusion_color}</span>\n`+
					`草稿狀態：${article.is_draft ? '√' : '×'}</code></pre>`+
					`</div>`,
					type: 'markdown',
					date: article.date,
					mod: article.mod,
				})
			}

			res.render('article', {
				article: article
			})
		})
		.catch(err => {
			res.status(404);
			res.render('pache-error', {
				err,
				title: 'Pache 404',
				articleTitle: '404',
				message: '文章或许不存在，或许请求的 id 是一个未知数，Pache 无法提供',
			})
		})
});

/* 文章列表 */

router.use('/', (req, res, next) => {
	req.tags = null;
	req.con = {};
	req.con.pagecode = 1;
	next();
})



router.use('*/tag/:tagraw', (req, res, next) => {
	req.con.tags = req.params.tagraw.split(',').map(str => str.trim());
	next();
});

router.use('*/category/:category', (req, res, next) => {
	req.con.category = req.params.category
	next()
})

router.use(['/tag/*', '/category/*'], (req, res, next) => {
	req.isHome = true;
	next();
})
router.use('/:pagecode', (req, res, next) => {
	if (!isNaN(req.params.pagecode)) {
		req.isHome = true;
	}
	next();
})
router.use('*/:pagecode', (req, res, next) => {
	let pagecode = Number(req.params.pagecode)
	if (!isNaN(pagecode)) {
		req.con.pagecode = pagecode
	}
	next()
})

router.get('/', (req, res, next) => {
	req.isHome = true;
	next()
})

const homeRender = (req, res, next) => {
	let category, list, categories;
	(() => {
		if (typeof(req.con.category) === 'string') {
			return libCategory.getByName(req.con.category)
				.then((result) => {
					if (result !== null) {
						category = result
						req.con.category = category._id.toString()
					}
				})
		} else {
			return Promise.resolve()
		}
	})()
		.then(() => libCategory.getAll())
		.then((res) => categories = res)
		.then(() => libArticle.find(
			(req.con.pagecode - 1) * envir.limit,
			envir.limit,
			{ tags: req.con.tags,
				category: req.con.category,
				is_draft: {$ne: true},
			}
		))
		.then(listResult => list = listResult)
		.then(() => libArticle.count({
			tags: req.con.tags,
			category: req.con.category,
			is_draft: {$ne: true},
		}))
		.then(count => {
			res.render('home', {
				code: 0,
				tags: req.tags,
				limit: envir.limit,
				page: req.con.pagecode,
				conditions: req.con,
				categories: categories || [],
				count,
				list,
			})
		})
		.catch(err => {
			let pacheError = new Error('pache error');
			pacheError.source = err;
			next(pacheError);
		});
};
router.get('/*', (req, res, next) => {
	if (req.isHome) {
		homeRender(req, res, next)
	} else {
		next()
	}
});


router.use(function (err, req, res, next) {
	console.error(err);
	res.status(err.status || 500);
	res.render('pache-error', {
		err,
		title: 'Pache 500',
		articleTitle: '错误',
		message: 'Pache 内部出现了偏差，你要负责',
		recommendTags: envir.recommend_tags
	})
})
