const express = require('express');
const envir = require('../../envir');
const article = require('../../lib/article');
const libCategory = require('../../lib/category');

const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/topic', (req, res) => {
	article.topic()
		.then(result => {
			if (result === null) { res.status(404) }
			res.json({
				code: 0,
				msg: 'ok',
				result,
			})
		})
		.catch(err => {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err,
			})
		})
})

router.post('/article', (req, res, next) => {
	const is_post = req.body.is_repost ? req.body.is_repost.toLowerCase() : '';
	if (is_post === 'false') {
		req.body.is_repost = false;
	} else if (is_post === 'true') {
		req.body.is_repost = true;
	}
	next();
})
router.post('/article', (req, res) => {
	article.insert(req.body)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(function (err) {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err,
			});
		})
});

router.delete('/articles', (req, res) => {
	const checkIds = new Promise((resolve, reject) => {
		if ((typeof(req.body.ids) === 'string') || Array.isArray(req.body.ids)) {
			resolve();
		} else {
			const err = new Error('no ids, or ids is not string or array');
			err.status = 400;
			reject(err);
		}
	});
	checkIds
		.then(() => article.del(req.body.ids))
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err: {
					message: err.message,
				}
			})
		})
});

router.patch('/article/:id', (req, res, next) => {
	const is_post = req.body.is_repost ? req.body.is_repost.toLowerCase() : '';
	if (is_post === 'false') {
		req.body.is_repost = false;
	} else if (is_post === 'true') {
		req.body.is_repost = true;
	}
	next();
})
router.patch('/article/:id', (req, res) => {
	article.mod(req.params.id, req.body)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(function (err) {
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err: {
					message: err.message,
				}
			})
		})
})

router.use('/articles/:pagecode', (req, res, next) => {
	let pagecode = Number(req.params.pagecode);
	if (isNaN(pagecode)) {
		pagecode = 1;
	}
	req.pagecode = pagecode;
	next();
});
router.use('/articles', (req, res, next) => {
	if (!('pagecode' in req)) {
		req.pagecode = 1;
	}
	next();
})

router.get(['/articles/*', '/articles/'], (req, res, next) => {
	let list;
	article.list(req.pagecode)
		.then(listResult => {
			list = listResult;
			return article.count();
		})
		.then(count => {
			res.json({
				code: 0,
				page: req.pagecode,
				count,
				limit: envir.limit,
				list,
			})
		})
		.catch(err => {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err: err,
			})
		})
});

router.get('/article/:articleid', (req, res, next) => {
	req.articleid = req.params.articleid;
	next();
});
router.get('/article/*', (req, res, next) => {
	article.get(req.articleid)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			res.status(err.status || 500)
			res.json({
				code: 1,
				msg: err.message,
				err: {
					message: err.message,
				},
			})
		})
});

router.delete('/category/:categoryid', (req, res, next) => {
	req.categoryid = req.params.categoryid
	next()
})
router.delete('/category/*', (req, res, next) => {
	if (req.categoryid) {
		libCategory.del([req.categoryid])
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 2,
				msg: err.message,
				err,
			});
		})
	} else {
		const err = new Error('沒有指定 categoryid');
		res.json({
			code: 1,
			msg: err.message,
			err,
		})
	}
})

router.patch('/category/:categoryid', (req, res, next) => {
	req.categoryid = req.params.categoryid
	next()
})
router.patch('/category/*', (req, res) => {
	if (req.categoryid) {
		libCategory.mod(req.categoryid, req.body)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 2,
				msg: err.message,
				err,
			});
		})
	} else {
		const err = new Error('沒有指定 categoryid');
		res.json({
			code: 1,
			msg: err.message,
			err,
		})
	}
})
router.post('/category', (req, res) => {
	libCategory.create(req.body)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err,
			});
		})
})

router.get('/categories', (req, res) => {
	libCategory.getAll()
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			console.error(err);
			res.status(err.status || 500);
			res.json({
				code: 1,
				msg: err.message,
				err,
			});
		})
})

module.exports = router;
