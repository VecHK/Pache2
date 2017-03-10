const fs = require('fs');
const cluster = require('cluster');
const envir = require('./envir');

const path = require('path');
const logger = require('morgan');

const favicon = require('serve-favicon');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const app = express();

const router_front = require('./router/front');

const staticDir = path.join(__dirname, 'static');
app.use(express.static(staticDir));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* Pache icon */
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));

//-----------------前台-----------------
app.use('/', router_front);

//-----------------后台-----------------
let redisHandle = new RedisStore({
	client: redis.createClient(6379, '127.0.0.1'),
	ttl: 3600 * 72,
	db: 2,
	prefix: 'pache-session:',
});

let sessinHandle = session({
	secret: envir.session_secret,
	cookie: { /* domain: 'localhost' */ },
	key: 'pache-session',
	resave: false,
	saveUninitialized: false,
	store: redisHandle,
});
app.use(sessinHandle);

const router_back = require('./router/back');
app.use('/admin', router_back);

if (envir.ESD_enable && Array.isArray(envir.ESD_list)) {
	envir.ESD_list.forEach((esd_path, item_count) => {
		try {
			const staticDir = path.join(esd_path);
			fs.statSync(staticDir);
			app.use(express.static(staticDir));
		} catch (e) {
			console.error(e);
			if (/ENOENT/.test(e.message)) {
				console.error(`ESD_list 中的第 ${item_count + 1}個目錄 ` +
					`[ ${envir.ESD_list[item_count]} ] 無法訪問，請確認權限或者存在性`
				);
			} else {
				console.error(`ESD_list 錯誤`);
			}
			process.exit();
		}
	})
}

module.exports = app;
