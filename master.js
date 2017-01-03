/*
	cluster 作负载均衡

 */
const cluster = require('cluster');
const envir = require('./envir');
const http = require('http');

if (cluster.isMaster) {
	process.stdout.write('Pache Envir ')
	envir.printInfo();

	const EventEmitter = require('events').EventEmitter;
	console.log(`\n------- 主线程启动 -------\n`);

	cluster.on('listening', (worker, address) => {
		console.log(`端口已应用: pid[${worker.process.pid}], address[${address.address}:${address.port}]`);
	});
	cluster.on('online', (worker) => {
		console.log(`cluster线程[${worker.id}]已在线`);
	});
	cluster.on('exit', (worker, code, signal) => {
		console.log(`cluster线程${worker.process.pid}已离线`);
	});

	if (envir.cluster_fork_num) {
		var CPUs = Array.from({length: envir.cluster_fork_num});
	} else {
		var CPUs = require('os').cpus();
	}
	const workers = CPUs.map(() => cluster.fork());
	envir.setEnvir(workers);
} else {
	const app = require('./app');
	const server = http.createServer(app);
	envir.get('port', value => {
		server.listen(value);
		server.on('error', (err) => {
			throw err;
		});
		//server.on('listening', onListening);
	})
}
