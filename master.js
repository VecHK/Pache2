const cluster = require('cluster');

module.exports = function () {
	const envir = require('./envir');
	if (cluster.isMaster) {
		envir.printInfo()

		const EventEmitter = require('events').EventEmitter;
		console.log(`\n------- 主线程启动 -------\n`);

		cluster.on('listening', (worker, address) => {
			console.log(`端口已应用: wid[${worker.id}], pid[${worker.process.pid}], address[${address.address}:${address.port}]`);
		});
		cluster.on('online', (worker) => {
			console.log(`线程[${worker.id}]已在线`);
		});
		cluster.on('exit', (worker, code, signal) => {
			console.log(`线程${worker.process.pid}已离线`);
		});

		if (envir.cluster_fork_num) {
			var CPUs = Array.from({length: envir.cluster_fork_num});
		} else {
			var CPUs = require('os').cpus();
		}
		const workers = CPUs.map(() => cluster.fork());
		envir.setEnvir(workers);
		workers.forEach(worker => {
			worker.send({
				type: 'web',
			})
		})
	} else {
		require('./worker')
	}
};
