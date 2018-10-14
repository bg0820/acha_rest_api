const dbConfig = require('./config.js');
const mysql = require('mysql');
const log = require('../Util/Log');

let pool;

module.exports = {
	init: function() {
		pool = mysql.createPool({
			host: dbConfig.host,
			user: dbConfig.user,
			password: dbConfig.password,
			database: dbConfig.database,
			timezone: dbConfig.timezone,
			waitForConnections: dbConfig.waitForConnections,
			connectionLimit: dbConfig.connectionLimit
		});
		log.info('Mariadb Initialize...');
	},

	getConnection: function(callback) {
		pool.getConnection(callback);
	},

	end: function(callback) {
		pool.end(callback);
	}
};
