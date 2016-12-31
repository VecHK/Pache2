const fs = require('fs');
const Suc = require('node-suc').Suc;
const suc = new Suc;
const cluster = require('cluster');
const package = require('../package');

const envir = require('./envir')

const getPool = [];
Object.assign(exports, envir, {
	get(propertyName, cb){
		cb(envir[propertyName]);
	}
});
