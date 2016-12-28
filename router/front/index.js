const express = require('express');
const envir = require('../../envir');
const article = require('../../lib/article');
const router = express.Router();
module.exports = router;

const has = (obj, ...keys) => keys.every(checkey => Object.keys(obj).some(objkey => objkey === checkey));

router.get('/article/:articleid', (req, res, next) => {
	req.articleid = req.params.articleid;
	next();
});
router.get('/article/*', (req, res, next) => {
	res.status(404);
	article.get(req.articleid)
		.then(article => {
			res.render('article', {
				article,
				recommandTags: envir.recommand_tags,
			})
		})
		.catch(err => {
			res.render('article-nofound', {
				err,
			})
		})
});


router.use('/', (req, res, next) => {
	req.tags = [];
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
	let list;
	article.getlist(req.pagecode, req.tags)
		.then(listResult => {
			list = listResult;
			return article.count(req.tags);
		})
		.then(count => {
		res.render('home', {
				code: 0,
				tags: req.tags,
				recommandTags: envir.recommand_tags,
				limit: envir.limit,
				page: req.pagecode,
				count,
				list,
			});
		}, err => {
			console.error(err);
			res.json({
				code: 2
			})
		})
		.catch(err => {
			console.error(err);
			res.json({
				code: 1
			})
		});
};

router.get('/', (req, res, next) => {
	req.pagecode = 1;
	render(req, res, next);
});
router.get('/*', (req, res, next) => {
	if (req.pagecode) {
		render(req, res, next);
	} else {
		next();
	}
});
