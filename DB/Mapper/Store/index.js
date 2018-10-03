const sql = require('../../sql.js');
const util = require('../../../Util');
const log = require('../../../Util/Log');

module.exports = {
	tokenCheck: function(_token) {
		return new Promise(function(resolve, reject) {
			var selectQuery = 'SELECT hex(storeUUID) storeUUID FROM Token WHERE token = ?';

			sql.select(selectQuery, [_token]).then(function(rows) {
				if(rows.length == 0) // 토큰 존재하지 않음
					throw 102;

				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	storeLogin: function(_id, _pw) {
		return new Promise(function(resolve, reject) {
			// 매장과 토큰
			var loginQuery = 'SELECT hex(Store.storeUUID) AS storeUUID, Store.storeName, Store.phoneNumber, Store.ceoPhoneNumber, Store.fullAddress, Store.roadAddress, Store.detailAddress, Token.token FROM acha.Store LEFT OUTER JOIN acha.Token ON Token.storeUUID = Store.storeUUID WHERE Store.id = ? and Store.pw = ?';

			sql.select(loginQuery, [_id, _pw]).then(function(rows) {
				if(rows.length == 0) // 존재하지 않는 아이디
					throw 200;

				return rows[0];
			}).then(function(row) {
				var _token = row.storeUUID + '-' + Number(new Date());

				// 없을경우 INSERT, 있을경우 UPDATE
				var insertQuery = "INSERT INTO Token (storeUUID, token) VALUES (UNHEX(?), ?) ON DUPLICATE KEY UPDATE storeUUID = UNHEX(?), token = ?;";

				if(row.token)
					return [row.token, row];
				else // 없는경우
				{
					sql.insert(insertQuery, [row.storeUUID, _token, row.storeUUID, _token])
					return [_token, row]; // 새로 만든 토큰 반환
				}
			}).then(function(result) {
				resolve(result);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	storeRegister: function(param) {
		return new Promise(function(resolve, reject) {

			var selectQuery = 'SELECT EXISTS(SELECT 1 FROM acha.Store WHERE id = ? LIMIT 1) as count';
			var query = "INSERT INTO Store (storeUUID, id, pw, storeName, phoneNumber, ceoPhoneNumber, fullAddress, roadAddress, detailAddress, entX, entY, regTime) VALUES (UNHEX(REPLACE(UUID(),'-',\"\")), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);";

			sql.select(selectQuery, [param[0]]).then(function(rows) {
				if(rows[0].count != 0) // 존재하는 아이디
					throw 300;

				// 새로운 아이디면 가입
				return sql.insert(query, param);
			}).then(function(result) {
				resolve(result);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	fcmGET: function(storeUUID) {
		return new Promise(function(resolve, reject) {
			var selectQuery = 'SELECT fcmKey FROM FcmKey WHERE storeUUID = UNHEX(?)';

			sql.select(selectQuery, [storeUUID]).then(function(rows) {
				var result = [];

				if(rows.length != 0)
				{
					for(var i = 0; i < rows.length; i++)
						result += rows[i];
				}

				resolve(result);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	fcmPOST: function(storeUUID, fcmKey) {
		return new Promise(function(resolve, reject) {
			var insertQuery = 'INSERT INTO FcmKey (storeUUID, fcmKey) VALUES(UNHEX(?), ?)';

			sql.insert(insertQuery, [storeUUID, fcmKey]).then(function(rows) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservUserCreate: function(_phoneNumberHash, _reservName) {
		return new Promise(function(resolve, reject) {
			var isUserQuery = 'SELECT hex(userUUID) userUUID FROM User WHERE phoneNumberHash = ?;'

			// isUser 유저가 존재하면 뱉어내고, 없으면
			sql.select(isUserQuery, [_phoneNumberHash]).then(function(rows) {
				if(rows.length != 0) // 유저가 존재
					resolve(rows[0].userUUID);

				var userCreateQuery = "INSERT INTO User (userUUID, phoneNumberHash, name, firstReservTime) VALUES (UNHEX(REPLACE(UUID(),'-',\"\")), ?, ?, CURRENT_TIMESTAMP)";
				return sql.insert(userCreateQuery, [_phoneNumberHash, _reservName]);
			}).then(function(rows) {

				// 생성된 UUID 리턴해야함
				var selectUUIDQuery = "SELECT hex(userUUID) AS userUUID FROM User WHERE phoneNumberHash = ?";
				return sql.select(selectUUIDQuery, [_phoneNumberHash]);
			}).then(function(rows) {
				resolve(rows[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reserv: function(param, _reservToken) {
		return new Promise(function(resolve, reject) {
			// 테이블 이름이 [창가1, 창가2] 로 들어오면 창가1, 창가2로 맞춰줌
			var isStatisticsExists = "SELECT EXISTS(SELECT 1 FROM acha.Statistics WHERE userUUID = UNHEX(?) and storeUUID = UNHEX(?) LIMIT 1) as count";
			sql.select(isStatisticsExists, [param[0], param[1]]).then(function(rows) {
				var insertQuery = "INSERT INTO Statistics (statisticsUUID, userUUID, storeUUID) VALUES(UNHEX(REPLACE(UUID(),'-',\"\")), UNHEX(?), UNHEX(?))";
				var updateQuery = "UPDATE Statistics SET reservCnt = reservCnt + 1 WHERE userUUID = UNHEX(?) and storeUUID = UNHEX(?)";

				// 없는경우 INSERT
				if(rows[0].count == 0)
					sql.insert(insertQuery, [param[0], param[1]]);
				else // 있는경우 UPDATE
					sql.update(updateQuery, [param[0], param[1]]);
			}).then(function() {
				var userUpdateQuery = "UPDATE User SET totalReservCnt = totalReservCnt + 1 WHERE userUUID = UNHEX(?)";
				var insertQuery = "INSERT INTO Reserv (reservUUID, userUUID, storeUUID, reservName, reservNumber, reservTime, reservTarget, reservMemo, reservToken, insertTime) VALUES (UNHEX(REPLACE(UUID(),'-',\"\")), UNHEX(?), UNHEX(?), ?, ?, ?, REPLACE(REPLACE(?, '[', ''), ']', ''), ?, ?, CURRENT_TIMESTAMP)";

				return Promise.all([sql.update(userUpdateQuery, [param[0]]), sql.insert(insertQuery, param)]);
			}).then(function() {
				// 예약 내용 삽입후 예약 토큰으로 UUID 를 가져와서 ReservLeftJoinStore 테이블 가져오기
				// param[7] = reservToken
				var selectQuery = 'SELECT * FROM ReservLeftJoinStore WHERE reservToken = ?';
				return sql.select(selectQuery, [param[7]]);
			}).then(function(result) {
				resolve(result[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservEdit: function(param) {
		return new Promise(function(resolve, reject) {

			var updateQuery = 'UPDATE ReservLookupTable SET reservNumber = COALESCE(?, reservNumber), phoneNumber = COALESCE(?, phoneNumber), phoneNumberHash = COALESCE(?, phoneNumberHash), reservTime = COALESCE(?, reservTime), reservName = COALESCE(?, reservName), reservTarget = COALESCE(?, reservTarget), reservMemo = COALESCE(?, reservMemo) WHERE reservUUID = UNHEX(?)';
			sql.update(updateQuery, param).then(function(rows) {
				resolve(rows);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservTableExistsCheck: function(storeUUID, startTime, endTime) {
		return new Promise(function(resolve, reject) {
			var isTableCheckQuery = "SELECT reservTarget FROM acha.Reserv WHERE storeUUID = UNHEX(?) and (reservTime BETWEEN ? AND ?) and (reservStatus = 'reservwait' or reservStatus = 'reserved' or reservStatus = 'visit' or reservStatus = 'noshow')";

			sql.select(isTableCheckQuery, [storeUUID, startTime, endTime]).then(function(rows) {
				// 테이블 이름만 가져와서 _reservedTableList 배열에 push 하고 보내줌
				var _reservedTableList = [];
				for(var i = 0; i < rows.length; i++)
					_reservedTableList = util.stringToArray(rows[i].reservTarget)
					console.log(_reservedTableList);
				resolve(_reservedTableList);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservSearch: function(param) {
		return new Promise(function(resolve, reject) {
			var searchQuery = 'SELECT * FROM ReservLookupTable WHERE reservName = ? or phoneNumberHash = ? or (reservTime >= ? and reservTime < ?)';

			sql.select(searchQuery, param).then(function(rows) {
				resolve(rows);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservCountToSearchRangeDate: function() {
		return new Promise(function(resolve, reject) {
			/*var searchQuery = 'SELECT hex(UUID) UUID, phoneNumber, reservName, reservNumber, reservTime, reservMemo, reservStatus, reservTarget, reservToken FROM Reserv WHERE reservName = ? or phoneNumber = ? or (reservTime >= ? and reservTime < ?)';

			sql.select(searchQuery, param).then(function(rows) {
				resolve(rows);
			}).catch(function(error) {
				reject(error);
			});*/
		});
	},

	reservInQuery: function(reservUUID, storeUUID) {
		return new Promise(function(resolve, reject) {
			var searchQuery = 'SELECT * FROM ReservLookupTable WHERE reservUUID = ? and storeUUID = ?';

			sql.select(searchQuery, [reservUUID, storeUUID]).then(function(rows) {
				if(rows.length == 0)
					throw 500;

				resolve(rows[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	settingGET: function(storeUUID) {
		return new Promise(function(resolve, reject) {
			var selectQuery = "SELECT * FROM StoreLeftJoinAlarmTalk WHERE storeUUID = ?";

			sql.select(selectQuery, [storeUUID]).then(function(rows) {
				resolve(rows[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	settingPOST: function(_alarmTalkInterval, _tables, _storeUUID) {
		return new Promise(function(resolve, reject) {
			// 테이블 이름이 [창가1, 창가2] 로 들어오면 창가1, 창가2로 맞춰줌
			// 알림톡 주기도 마찬가지
			var updateQuery = "UPDATE Store SET alarmTalkInterval = COALESCE(REPLACE(REPLACE(?, '[', ''), ']', ''), alarmTalkInterval), targets = COALESCE(REPLACE(REPLACE(?, '[', ''), ']', ''), targets) WHERE storeUUID = UNHEX(?)";

			sql.update(updateQuery, [_alarmTalkInterval, _tables, _storeUUID]).then(function(rows) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	userStatisticsInfo: function(_storeUUID, _phoneNumberHash) {
		return new Promise(function(resolve, reject) {
			// 전체는 예약횟수랑, 노쇼만 보여주고 매장은 다보여줌
			var selectUserPhoneNumberToUUID = "SELECT totalReservCnt, totalNoshowCnt, storeReservCnt, storeReservedCnt, storeStoreCancelCnt, storeUserCancelCnt, storeVisitCnt, storeNoshowCnt FROM UserLeftJoinStatistics WHERE storeUUID = ? and phoneNumberHash = ?";

			sql.select(selectUserPhoneNumberToUUID, [_storeUUID, _phoneNumberHash]).then(function(rows) {
				console.log(rows.length);
				var resultJson = {
					storeNoshowCnt: 0,
					storeReservCnt: 0,
					storeReservedCnt: 0,
					storeStoreCancelCnt: 0,
					storeUserCancelCnt: 0,
					storeVisitCnt: 0,
					totalNoshowCnt: 0,
					totalReservCnt: 0
				};

				if(rows.length == 0)
					resolve(resultJson);

				resolve(rows[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	}

}
