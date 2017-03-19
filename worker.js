const fs = require('fs');
const https = require('https');
const express = require('express');
const envir = require('./envir');
const cluster = require('cluster');

process.on('message', (message) => {
	if (message.type === 'envir') {
		Object.assign(envir, message.envir);

		console.log(`worker[${cluster.worker.id}] Envir was set`);
	} else if (message.type === 'web') {
		const http = require('http');
		let app = require('./app');

		if (envir.enable_https) {
			const credentials = {};
			try {
				Object.assign(credentials, {
					key: fs.readFileSync(envir.private_key, 'utf8'),
					cert: fs.readFileSync(envir.certificate, 'utf8'),
				})
			} catch (e) {
				console.error('無法讀取 private_key/certificate 路徑')
				throw e
			}

			const httpsServer = https.createServer(credentials, app);
			httpsServer.listen(envir.https_port);
			httpsServer.on('error', (err) => {
				throw err;
			});
			httpsServer.on('listening', () => {
			});

			/* 檢查是否是強制使用 https 的配置 */
			if (envir.force_https) {
				app = express();
				if (envir.force_redirect_to_master_domain) {
					app.all('*', (req, res, next) => {
						if (req.headers['host'].trim() === envir.master_domain.trim()) {
							next()
						} else {
							res.redirect("http://" + envir.master_domain + req.url);
							res.end('')
						}
					})
				}
				app.all('*', (req, res) => {
					res.redirect("https://" + req.headers['host'] + req.url);
					return res.end()
				});
			}
		}

		const server = http.createServer(app);
		server.listen(envir.port);
		server.on('error', (err) => {
			throw err;
		});
		server.on('listening', () => {
		});
	}
});
