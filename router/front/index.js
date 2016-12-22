const express = require('express');
const model = require('../../model');
const router = express.Router();
module.exports = router;

const ObjectId = function (id) {
  return mongoose.Types.ObjectId(id);
};
const has = (obj, ...keys) => keys.every(checkey => Object.keys(obj).some(objkey => objkey === checkey));

router.use('/article/', (req, res, next) => {
	req.articleid = '???';
	next();
});
router.get('/article/:articleid', (req, res, next) => {
	req.articleid = req.params.articleid;
	next();
});
router.get('/article/*', (req, res, next) => {
	res.status(404);
	res.end('articleid: ' + req.articleid);
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

let render = (req, res, next) => {
	res.end('page: ' + req.pagecode);
}
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
})
