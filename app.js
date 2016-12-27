const cluster = require('cluster');
const envir = require('./envir');

const path = require('path');
const logger = require('morgan');

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const app = express();

const router_front = require('./router/front');

const staticDir = path.join(__dirname, 'static');
app.use(express.static(staticDir));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', router_front);

//-----------------后台-----------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let redisHandle = new RedisStore({
	client: redis.createClient(6379, '127.0.0.1'),
	ttl: 3600 * 72,
	db: 2,
	prefix: 'pache-session:',
});

let sessinHandle = session({
	secret: envir.session_secret,
	cookie: { domain: 'localhost' },
	key: 'pache-session',
	resave: false,
	saveUninitialized: false,
	store: redisHandle,
});
app.use(sessinHandle);

const router_back = require('./router/back');
app.use('/admin', router_back);

module.exports = app;
