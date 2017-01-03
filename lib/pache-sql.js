var MySQL = require('mysql');

class PacheSQL {
	connect(){
		return new Promise((resolve, reject) => this.sql.connect(err => err ? reject(err) : resolve()))
	}
	disconnect(){ this.sql.end() }
	query(queryString){
		return new Promise((resolve, reject) => {
			this.sql.query(queryString, function (err, rows, fields) {
				if (err) {
					reject(err)
				} else {
					resolve(rows, fields)
				}
			});
		})
	}
	constructor(sql){
		this.sql = MySQL.createConnection(sql)
	}
}

module.exports = PacheSQL;
