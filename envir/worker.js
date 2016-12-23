const cluster = require('cluster');
const envir = require('./envir');


process.on('message', (message) => {
	if (message.type === 'envir') {
		Object.assign(envir, message.envir);
		envir._setup = true;
		getPool.forEach(function (cb) {
			cb();
		});
		getPool.splice(0);

		console.log(`worker[${cluster.worker.id}] Envir was set`);
	}
});


const getPool = [];
Object.assign(envir, {
	get(propertyName, cb){
		cb(envir[propertyName]);
	}
});

module.exports = envir;
