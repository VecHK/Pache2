const PacheSQL = require('../lib/pache-sql')

const should = require('should');

describe('PacheSQL', function () {
	const SQLInfomation = {
		host: 'localhost',
		user: 'root',
		password: 'root',
		port: 3306,
	};
	const TEST_TABLE = 'pache_test';
	const TEST_DB = `pache_test_db`;

	it('preCreateADB', function (done) {
		this.timeout(5000);
		const sql = new PacheSQL(SQLInfomation)

		sql.connect()
			.then(() => sql.query(`CREATE DATABASE \`pache_test_db\``))
			.then((row, fields) => done())
			.catch(err => { done() })

		Object.assign(SQLInfomation, { database: TEST_DB })
	})

	it('Connect Success', done => {
		const sql = new PacheSQL(SQLInfomation)
		sql.connect()
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('Connect Fail', done => {
		const sql = new PacheSQL({ host: 'localhost', port: 9988, user: 'abc', password: '777', database: '不可能存在的数据库' })
		sql.connect()
			.then(() => { console.log('不可能到这里的，常考') })
			.catch(err => { done() })
	})
	it('Disconnect', done => {
		const sql = new PacheSQL(SQLInfomation)
		sql.connect()
			.then(() => {
				sql.disconnect()
				done()
			})
			.catch(err => { console.error(err); throw err })
	})
	it('query', done => {
		const sql = new PacheSQL(SQLInfomation)
		sql.connect()
			.then(() => sql.query(`SET NAMES utf8`))
			.then(() => done())
			.catch(err => { console.error(err); throw err })
	})
	it('query fail', done => {
		const sql = new PacheSQL(SQLInfomation)
		sql.connect()
			.then(() => sql.query(`SET NAMES unknowncharencode`))
			.catch(err => { done() })
	})
})
