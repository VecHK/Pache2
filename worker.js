const fs = require('fs');
const https = require('https');
const koa = require('koa')
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

			var aliasObj
			if (envir.ALIAS_CONFIG_FILE) {
			  let file
			  try {
			    file = fs.readFileSync(envir.ALIAS_CONFIG_FILE).toString()
			    aliasObj = JSON.parse(file)
			  } catch (e) {
					console.warn(`Pache alias 錯誤，請檢查 alias 文件('${envir.ALIAS_CONFIG_FILE}')是否存在，或者是否是合法的 JSON`)
					process.exit(-1)
			  }
			}

			if (envir.force_https) {
				/* 檢查是否是強制使用 https 的配置，如果是就替換 app 為跳轉到 https 的路由 */
				app = new koa()

				envir.ALIAS_CONFIG_FILE && app.use(async (ctx, next) => {
					const host = ctx.host.replace(/:([0-9])*$/, '')
					const portString = ctx.host.replace(host, '') // :xxx

					// 如果域名存在于 alias 中
					if (host in aliasObj) {
						return ctx.redirect(`${ctx.protocol}://${aliasObj[host]}${portString}${ctx.url}`)
					} else {
						await next()
					}
				})

				if (envir.force_redirect_to_master_domain) {
					app.use(async (ctx, next) => {
						if (ctx.host.trim() !== envir.master_domain.trim()) {
					    return ctx.redirect(`https://${envir.master_domain}${ctx.url}`)
					  }
						await next()
					})
				}

				app.use(async ctx => {
					ctx.redirect('https://' + ctx.host + ctx.url)
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
