const config = require('config.js');
const mysql = require('mysql');

module.exports = function() {
	var pool = mysql.createPool({
	    host: config.host,
	    user: config.user,
	    password: config.password,
	    database: config.database
  	});

	var connection = {
		getConnection: function(callback) { // connection pool 을 생성
			pool.getConnection(callback);
		},
		end: function(callback) {
			pool.end(callback);
		}
	}

	return connection;
}();
