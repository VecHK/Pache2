const fs = require('fs');
const https = require('https');
const koa = require('koa')
const express = require('express');
const envir = require('./envir');
const cluster = require('cluster');

process.on('message', (message) => {
	if (message.type === 'envir') {
		Object.assign(envir, message.envir);

		console.log(`worker[${cluster.worker.id}] Envir was set`);
	} else if (message.type === 'web') {
		const http = require('http');
		let app = require('./app-t');

		if (envir.enable_https) {
			const credentials = {};
			try {
				Object.assign(credentials, {
					key: fs.readFileSync(envir.private_key, 'utf8'),
					cert: fs.readFileSync(envir.certificate, 'utf8'),
				})
			} catch (e) {
				console.error('無法讀取 private_key/certificate 文件')
				throw e
			}

			const httpsServer = https.createServer(credentials, app.callback())
			httpsServer.listen(envir.https_port);
			httpsServer.on('error', (err) => {
				console.error('https Server 錯誤', e.message)
				throw err;
			});
			httpsServer.on('listening', () => { });

			if (envir.force_https) {
				/* 檢查是否是強制使用 https 的配置，如果是就替換 app 為跳轉到 https 的路由 */
				app = new koa()

				app.use(async ctx => {
					ctx.redirect('https://' + ctx.request.headers['host'] + ctx.url)
				})
			}
		}

		const server = http.createServer(app.callback());
		server.listen(envir.port);
		server.on('error', (err) => {
			console.error('http Server 錯誤', e.message)
			throw err;
		});
		server.on('listening', () => {
		});
	}
});
