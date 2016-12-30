const express = require('express');
const envir = require('../../envir');
const utils = require('utility');
const randomString = require('../../lib/random-string');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const auth = (randomString, truePw, authCode) => {
	console.log(`soup: ${utils.md5(randomString + truePw)}\ntrup: ${authCode}`);
	return authCode === utils.md5(randomString + truePw);
};

/* 获取随机码 */
router.get('/auth', (req, res, next) => {
	delete req.session.user;
	req.session.random = randomString(16);
	res.end(req.session.random);
});

router.get('/authed', (req, res, next) => {
	if ('user' in req.session) {
		res.end('true');
	} else {
		res.end('false');
	}
});

router.get('/logout', (req, res, next) => {
	delete req.session.user;

	res.status(200);
	res.end('true');
});

/* 登陆认证 */
router.post('/auth', (req, res, next) => {
	//console.log(req.body.pass);
	if (!('random' in req.session)) {
		res.status(403);
		return res.end('need randomCode');
	}

	if (auth(
		req.session.random,
		envir.pass,
		String(req.body.pass)
	)) {
		req.session.user = true;
		res.status(200);
		res.end('ok');
	} else {
		res.status(403);
		res.end('fail');
	}
});

router.use((req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		res.status(403);
		res.end('need login');
	}
});

module.exports = router;
