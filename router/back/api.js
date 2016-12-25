const express = require('express');
const envir = require('../../envir');
const article = require('../../lib/article');

const router = express.Router();

const sendJson = function (obj) { this.end(JSON.stringify(obj)) };

router.get('/topic', (req, res) => {
	article.topic()
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => {
			console.error(err);
			res.json({
				code: 1,
				msg: fail,
				err,
			})
		})
})

router.post('/article', (req, res) => {
	article.insert(req.body)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => res.json({
			code: 1,
			msg: 'fail',
			err,
		}))
});

router.delete('/articles', (req, res) => {
	let idArr = Array.isArray(req.body.ids) ? req.body.ids : [req.body.ids];
	article.del(idArr)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => res.json({
			code: 1,
			msg: 'fail',
			err: {
				message: err.message,
			}
		}))
});

router.patch('/article/:id', (req, res) => {
	article.mod(req.params.id, req.body)
		.then(result => res.json({
			code: 0,
			msg: 'ok',
			result,
		}))
		.catch(err => res.json({
			code: 1,
			msg: 'fail',
			err: {
				message: err.message,
			}
		}))
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
	article.getlist(req.pagecode)
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
		})
})

module.exports = router;
