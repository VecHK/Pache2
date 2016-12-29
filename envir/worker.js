const cluster = require('cluster');
const envir = require('./envir');


process.on('message', (message) => {
	if (message.type === 'envir') {
		Object.assign(envir, message.envir);

		console.log(`线程[${cluster.worker.id}] Envir 对象已设置`);
	}
});


const getPool = [];
Object.assign(envir, {
	get(propertyName, cb){
		cb(envir[propertyName]);
	}
});

module.exports = envir;
