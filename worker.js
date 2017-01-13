const envir = require('./envir');
const cluster = require('cluster');

process.on('message', (message) => {
	if (message.type === 'envir') {
		Object.assign(envir, message.envir);

		console.log(`worker[${cluster.worker.id}] Envir was set`);
	} else if (message.type === 'web') {
		const http = require('http');
		const app = require('./app');
		const server = http.createServer(app);

		server.listen(envir.port);
		server.on('error', (err) => {
			throw err;
		});
		server.on('listening', () => {
			
		});
	}
});
