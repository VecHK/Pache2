const express = require('express');
const envir = require('../../envir');
const article = require('../../lib/article');
const router = express.Router();
module.exports = router;

//const has = (obj, ...keys) => keys.every(checkey => Object.keys(obj).some(objkey => objkey === checkey));

router.get('/article/:articleid', (req, res, next) => {
	req.articleid = req.params.articleid;
	next();
});
router.get('/article/*', (req, res, next) => {
	article.get(req.articleid)
		.then(article => {
			if (article === null) {
				return Promise.reject(new Error('article nofound'))
			}
			res.render('article', {
				article,
				recommendTags: envir.recommend_tags,
			})
		})
		.catch(err => {
			res.status(404);
			res.render('pache-error', {
				err,
				title: 'Pache 404',
				articleTitle: '404',
				message: '文章或许不存在，或许请求的 id 是一个未知数，Pache 无法提供',
				recommendTags: envir.recommend_tags
			})
		})
});


router.use('/', (req, res, next) => {
	req.tags = null;
	next();
})

const tagMiddleware = (req, res, next) => {
	req.pagecode = 1;
	req.tags = req.params.tagraw.split(',').map(str => str.trim());
	next();
};
router.use('/tag/:tagraw', tagMiddleware);
router.use('/*/tag/:tagraw', tagMiddleware);

router.use('/:pagecode', (req, res, next) => {
	let pagecode = Number(req.params.pagecode);
	if (!isNaN(pagecode)) {
		req.pagecode = pagecode;
	}
	next();
});

const render = (req, res, next) => {
	let tagCon;
	if (Array.isArray(req.tags)) {
		tagCon = req.tags;
	}
	article.getlist(req.pagecode, tagCon)
		.then(listResult => list = listResult)
		.then(() => article.count(tagCon))
		.then(count => {
			res.render('home', {
				code: 0,
				tags: req.tags,
				recommendTags: envir.recommend_tags,
				limit: envir.limit,
				page: req.pagecode,
				count,
				list,
			});
		})
		.catch(err => {
			let pacheError = new Error('pache error');
			pacheError.source = err;
			next(pacheError);
		});
};

router.get('/', (req, res, next) => {
	req.pagecode = 1;
	next();
});
router.get('/*', (req, res, next) => {
	if (req.pagecode) {
		render(req, res, next);
	} else {
		next();
	}
});

router.use(function (err, req, res, next) {
	if (err instanceof Error) {
		res.status(500);
		res.render('pache-error', {
			err,
			title: 'Pache 500',
			articleTitle: '错误',
			message: 'Pache 内部出现了偏差，你要负责',
			recommendTags: envir.recommend_tags
		})
	} else {
		next();
	}
})
