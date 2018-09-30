const pool = require('./connection.js');

module.exports = {
	query: function(sql) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, con) {
				con.query(sql, function(err, rows) {
					con.release();

					if(err)
						reject(err);

					resolve(rows);
				});
			});
		});
	},

	/**
	* @param {string} sql SELECt * FROM user where id = ?
	* @param {array} params ['bg0820', 'bg0820@naver.com', '22'];
	*/
	select: function(sql, params) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, con) {
				con.query(sql, params, function(err, rows) {
					con.release();
					if(err)
						reject(err);

					resolve(rows);
				});
			});
		});
	},


	/**
	* @param {string} sql INSERT INTO user (id, email, age) VALUES(?, ?, ?)
	* @param {array} params ['bg0820', 'bg0820@naver.com', '22'];
	*/
	insert: function(sql, params) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, con) {
				con.query(sql, params, function(err, rows) {
					con.release();

					if(err)
						reject(err);

					if(rows)
						resolve(rows.insertId);
					else
						resolve(true);
				});
			});
		});
	},

	/**
	* @param {string} sql UPDATE user SET id=?, email=? WHERE age=?
	* @param {array} params ['bg0820', 'bg0820@naver.com', '22'];
	*/
	update: function(sql, params) {
		return new Promise(function(resolve, reject) {

			pool.getConnection(function(err, con) {
				con.query(sql, params, function(err, rows) {
					con.release();

					if(err)
						reject(err);

					resolve(rows);
				});
			});
		});
	},

	/**
	* @param {string} sql DELETE FROM user WHERE id=?
	* @param {array} params ['bg0820'];
	*/
	delete: function(sql, params, callback) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, con) {
				con.query(sql, params, function(err, rows) {
					con.release();

					if(err)
						reject(err);

					resolve(rows);
				});
			});
		});
	}
};
