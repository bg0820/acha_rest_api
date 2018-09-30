const sql = require('../sql.js');
const log = require('../../Util/Log');

module.exports = {
	/*
	reservStatusChangeLog: function(reservUUID, changeStatus) {
		return new Promise(function(resolve, reject) {
			var insertQuery = "INSERT INTO ReservStatusChangeLog (reservUUID, changeStatus, changeDate) VALUES (UNHEX(?), ?, CURRENT_TIMESTAMP)";

			sql.insert(insertQuery, [reservUUID, changeStatus]).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	}, */

	updateStatistics: function(_reservUUID, _changeStatus, _type, _param)
	{
		return new Promise(function(resolve, reject) {
			var statusChangeLogQuery = "INSERT INTO ReservStatusChangeLog (reservUUID, changeStatus, changeDate) VALUES (UNHEX(?), ?, CURRENT_TIMESTAMP)";
			var reservStatusChangeQuery = "UPDATE Reserv SET reservStatus = ? WHERE UUID = UNHEX(?)";

			// 예약 상태 변경 기록
			var reservStatusChangeLogPromise = sql.insert(statusChangeLogQuery, [_reservUUID, _changeStatus]);
			// 예약 상태 변경
			var reservStatusUpdatePromise = sql.update(reservStatusChangeQuery, [_changeStatus, _reservUUID]);

			Promise.all([reservStatusChangeLogPromise, reservStatusUpdatePromise]).then(function(result) {
				//var storeSelectQuery = 'SELECT '
				/*return Promise.all([result[0]]);*/
				resolve(true);
			}).catch(function(error){
				reject(error);
			});
		});
	}
}
