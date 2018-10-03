const sql = require('../sql.js');
const log = require('../../Util/Log');
const util = require('../../Util');

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

	getNotification: function(storeUUID, date) {
		return new Promise(function(resolve, reject) {
			var selectQuery = 'SELECT * FROM AlertMsg WHERE storeUUID = ? and date > ?';

			sql.select(selectQuery, [storeUUID, date]).then(function(result) {
				resolve(result);
			}).catch(function(error) {
				reject(error);
			})
		});
	},

	updateStatistics: function(_reservUUID, _changeStatus, _type, _param)
	{
		return new Promise(function(resolve, reject) {
			var statusChangeLogQuery = "INSERT INTO ReservStatusChangeLog (reservUUID, changeStatus, changeDate) VALUES (UNHEX(?), ?, CURRENT_TIMESTAMP)";
			var reservStatusChangeQuery = "UPDATE Reserv SET reservStatus = ? WHERE UUID = UNHEX(?)";
			var selectFcmKey = "SELECT FcmKey.fcmKey, Store.storePhoneNumber, Store.storeName, Reserv.phoneNumber, Reserv.reservName, Reserv.reservNumber, Reserv.reservTime FROM acha.Reserv JOIN (acha.Store LEFT JOIN acha.FcmKey ON FcmKey.storeUUID = Store.UUID) ON Reserv.storeUUID = Store.UUID WHERE Reserv.UUID = UNHEX(?)";
			// 예약 상태 변경 기록 log
			var reservStatusChangeLogPromise = sql.insert(statusChangeLogQuery, [_reservUUID, _changeStatus]);
			// 예약 상태 변경 status
			var reservStatusUpdatePromise = sql.update(reservStatusChangeQuery, [_changeStatus, _reservUUID]);
			var getFcmKeySelect = sql.select(selectFcmKey, [_reservUUID]);

			Promise.all([getFcmKeySelect, reservStatusChangeLogPromise, reservStatusUpdatePromise]).then(function(result) {
				/*if(_changeStatus == 'reserved')

				else if(_changeStatus == 'reservwait')

				else if(_changeStatus == 'storecancel')
				{
					if(_type == 'Store' && param)
					{
						// 알림톡 서버로 예약 정보 넘겨주면 사용자에게 핸드폰번호로 문자 전송
						var parm = {
							storePhoneNumber: result[1].phoneNumber,
							storeName: result[1].storeName,
							phoneNumber: result[2].phoneNumber,
							reservName: result[2].name,
							reservNumber: result[2].reservNumber,
							reservDate: result[2].reservTime,
							reason: param.reason
						};

						util.requestPost('http://test.io:5000/store/cancel', parm);
					}
				}
				else if(_changeStatus == 'usercancel')

				else if(_changeStatus == 'noshow')

				else if(_changeStatus == 'visit')
*/
				resolve(true);
			}).catch(function(error){
				reject(error);
			});
		});
	}
}
