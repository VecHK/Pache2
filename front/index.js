const Router = require('koa-router');

const article = require('./article');
const home = require('./home');

const router = new Router;

router.use('/article', article.routes(), article.allowedMethods());

router.use('', home.routes(), home.allowedMethods());

module.exports = router;
