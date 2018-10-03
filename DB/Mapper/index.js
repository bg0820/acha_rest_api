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
			// 예약 상태 변경기록에 INSERT
			var statusChangeLogQuery = "INSERT INTO ReservStatusChangeLog (reservUUID, changeStatus, changeDate) VALUES (UNHEX(?), ?, CURRENT_TIMESTAMP)";
			// Reserv테이블 예약 상태 Update
			var reservStatusChangeQuery = "UPDATE Reserv SET reservStatus = ? WHERE reservUUID = UNHEX(?)";

			Promise.all([sql.insert(statusChangeLogQuery, [_reservUUID, _changeStatus]), sql.update(reservStatusChangeQuery, [_changeStatus, _reservUUID])]).then(function(result) {
				// reservUUID 에 해당하는 storeUUID 를 가지고 FcmKey 조회
				var selectFcmKey = "SELECT fcmKey FROM Reserv JOIN FcmKey ON Reserv.storeUUID = FcmKey.storeUUID WHERE Reserv.reservUUID = ?";
				var selectReservInfo = "SELECT * FROM ReservJoinStoreUser WHERE reservUUID = ?";

				return Promise.all([sql.select(selectFcmKey, [_reservUUID]), sql.select(selectReservInfo, [_reservUUID]) ]);
			}).then(function(result) {
				var fcmKeys = result[0];
				var row = result[1][0];
				var totalUpdateQueryStr = '';
				var storeUpdateQueryStr = '';

				if(_changeStatus == 'reservwait')
				{
					totalUpdateQueryStr = "totalReservCnt = totalReservCnt + 1";
					storeUpdateQueryStr = "storeReservCnt = storeReservCnt + 1";
				}
				else if(_changeStatus == 'reserved')
				{
					totalUpdateQueryStr = "totalReservedCnt = totalReservCnt + 1";
					storeUpdateQueryStr = "storeReservedCnt = storeReservCnt + 1";
				}
				else if(_changeStatus == 'storecancel')
				{
					if(_type == 'Store' && _param)
					{
						// 알림톡 서버로 예약 정보 넘겨주면 사용자에게 핸드폰번호로 문자 전송
						var parm = {
							storePhoneNumber: row.storePhoneNumber,
							storeName: row.storeName,
							phoneNumber: row.userPhoneNumber,
							reservName: row.userName,
							reservNumber: row.reservNumber,
							reservDate: row.reservTime,
							reason: _param.reason
						};

						util.requestPost('http://test.acha.io:5000/store/cancel', parm);
					}
					totalUpdateQueryStr = "totalStoreCancelCnt = totalStoreCancelCnt + 1";
					storeUpdateQueryStr = "storeStoreCancelCnt = storeStoreCancelCnt + 1";
				}
				else if(_changeStatus == 'usercancel')
				{
					totalUpdateQueryStr = "totalUserCancelCnt = totalUserCancelCnt + 1";
					storeUpdateQueryStr = "storeUserCancelCnt = storeUserCancelCnt + 1";
				}
				else if(_changeStatus == 'noshow')
				{
					totalUpdateQueryStr = "totalNoshowCnt = totalNoshowCnt + 1";
					storeUpdateQueryStr = "storeNoshowCnt = storeNoshowCnt + 1";
				}
				else if(_changeStatus == 'visit')
				{
					totalUpdateQueryStr = "totalVisitCnt = totalVisitCnt + 1";
					storeUpdateQueryStr = "storeVisitCnt = storeVisitCnt + 1";
				}

				var reservTargetArr = util.stringToArray(row.reservTarget);
				var param = {
					storeId: row.storeUUID, // 전송해야할 매장
					type: _type, // 메시지 타입
					reservId: _reservUUID,
					changeStatus: _changeStatus,
					reservName: row.reservName,
					reservNumber: row.reservNumber,
					reservTime: row.reservTime,
					reservMemo: row.reservMemo,
					reservTarget: reservTargetArr,
					userPhoneNumber: row.userPhoneNumber,
					msg: '',
					date: new Date() // 예약 발생 시간
				};
				const noti = require('../../Notification');
				// pc 포스기로 소켓 전송
				noti.pcPushData(row.storeUUID, param);

				// 알림 로그
				var pr1 = sql.insert('INSERT INTO AlertMsg (storeUUID, reservUUID, caller, changeStatus, msg, date) VALUES(UNHEX(?), UNHEX(?), ?, ?, ?, CURRENT_TIMESTAMP)', [row.storeUUID, _reservUUID, _type, _changeStatus, '']);
				// 예약 통계 올리기 pr2 = 매장, pr3 = 전체
				var pr2 = sql.update('UPDATE UserLeftJoinStatistics SET ' + storeUpdateQueryStr + ' WHERE storeUUID = ? and userUUID = ?', [row.storeUUID, row.userUUID]);
				var pr3 = sql.update('UPDATE UserLeftJoinStatistics SET ' + totalUpdateQueryStr + ' WHERE storeUUID = ? and userUUID = ?', [row.storeUUID, row.userUUID]);

				return Promise.all([pr1, pr2, pr3]);
			}).then(function(result) {
				resolve(true);
			}).catch(function(error){
				reject(error);
			});
		});
	}
}
