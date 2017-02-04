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
			res.render('article', {
				article,
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
	let category;
	(() => {
		if (typeof(req.con.category) === 'string') {
			return libCategory.get(req.con.category)
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
		.then(() => libArticle.list(req.con.pagecode, {category: req.con.category, tags: req.con.tags}))
		.then(listResult => list = listResult)
		.then(() => libArticle.count(req.con.tags, req.con.category))
		.then(count => {
			console.log('count:', count)
			console.log(req.con)
			res.render('home', {
				code: 0,
				tags: req.tags,
				limit: envir.limit,
				page: req.con.pagecode,
				conditions: req.con,
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
