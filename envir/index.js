const cluster = require('cluster');

if (cluster.isMaster) {
	module.exports = require('./master');
} else if (cluster.isWorker) {
	module.exports = require('./worker');
}
