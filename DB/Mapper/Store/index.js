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
			var loginQuery = 'SELECT hex(Store.storeUUID) AS storeUUID, Store.storeName, Store.phoneNumber, Store.ceoPhoneNumber, Store.fullAddress, Store.roadAddress, Store.detailAddress, Store.defaultReservTimeSpanMin, Token.token FROM acha.Store LEFT OUTER JOIN acha.Token ON Token.storeUUID = Store.storeUUID WHERE Store.id = ? and Store.pw = ?';

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

	reservUserCreate: function(_phoneNumber, _phoneNumberHash, _reservName) {
		return new Promise(function(resolve, reject) {
			var isUserQuery = 'SELECT hex(userUUID) userUUID FROM User WHERE phoneNumberHash = ?;'

			// isUser 유저가 존재하면 뱉어내고, 없으면
			sql.select(isUserQuery, [_phoneNumberHash]).then(function(rows) {
				//console.log(rows[0].userUUID);

				// TODO: 여기서 새로 가입한유저 오류ㅜ나는부분 해결중이였음
				if(rows.length != 0) // 유저가 존재
					resolve(rows[0].userUUID);


				var userCreateQuery = "INSERT INTO User (userUUID, phoneNumber, phoneNumberHash, name, firstReservTime) VALUES (UNHEX(REPLACE(UUID(),'-',\"\")), ?, ?, ?, CURRENT_TIMESTAMP)";
				return sql.insert(userCreateQuery, [_phoneNumber, _phoneNumberHash, _reservName]);
			}).then(function(rows) {

				// 생성된 UUID 리턴해야함
				var selectUUIDQuery = "SELECT hex(userUUID) AS userUUID FROM User WHERE phoneNumberHash = ?";
				return sql.select(selectUUIDQuery, [_phoneNumberHash]);
			}).then(function(rows) {
				resolve(rows[0].userUUID);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reserv: function(param, _reservToken) {
		return new Promise(function(resolve, reject) {
			// 테이블 이름이 [창가1, 창가2] 로 들어오면 창가1, 창가2로 맞춰줌
			//var userUpdateQuery = "UPDATE User SET totalReservCnt = totalReservCnt + 1 WHERE userUUID = UNHEX(?)";
			var insertQuery = "INSERT INTO Reserv (reservUUID, userUUID, storeUUID, reservName, reservNumber, reservTime, reservTimeSpanMin, reservTarget, reservMemo, reservToken, insertTime) VALUES (UNHEX(REPLACE(UUID(),'-',\"\")), UNHEX(?), UNHEX(?), ?, ?, ?, ?, REPLACE(REPLACE(?, '[', ''), ']', ''), ?, ?, CURRENT_TIMESTAMP)";

			sql.insert(insertQuery, param).then(function(result) {
				// 예약 내용 삽입후 예약 토큰으로 UUID 를 가져와서 ReservLeftJoinStore 테이블 가져오기
				// param[8] = reservToken
				var selectQuery = 'SELECT * FROM ReservLeftJoinStore WHERE reservToken = ?';
				return sql.select(selectQuery, [param[8]]);
			}).then(function(result) {
				resolve(result[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservEdit: function(param) {
		return new Promise(function(resolve, reject) {
			var updateQuery = 'UPDATE Reserv SET reservNumber = COALESCE(?, reservNumber), reservTime = COALESCE(?, reservTime), reservTarget = COALESCE(?, reservTarget), reservTimeSpanMin = COALESCE(?, reservTimeSpanMin), reservMemo = COALESCE(?, reservMemo) WHERE reservUUID = UNHEX(?)';
			sql.update(updateQuery, param).then(function(rows) {
				resolve(rows);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservTableExistsCheck: function(storeUUID, startTime, endTime) {

		return new Promise(function(resolve, reject) {
			var isTableCheckQuery = "SELECT reservTarget FROM acha.Reserv WHERE storeUUID = UNHEX(?) and ((reservTime >= ? AND reservTime < ?) or (? < ADDTIME(reservTime , SEC_TO_TIME(reservTimeSpanMin * 60)) and ? >= ADDTIME(reservTime , SEC_TO_TIME(reservTimeSpanMin * 60)))) and NOT (reservStatus = 'usercancel' or reservStatus = 'storecancel')";
			sql.select(isTableCheckQuery, [storeUUID, startTime, endTime, startTime, endTime]).then(function(rows) {
				// 테이블 이름만 가져와서 _reservedTableList 배열에 push 하고 보내줌
				var _reservedTableList = [];

				for(var i = 0; i < rows.length; i++)
				{
					var arr = util.stringToArray(rows[i].reservTarget);
					for(var j = 0 ; j < arr.length; j++)
						_reservedTableList.push(arr[j]);
				}

				resolve(_reservedTableList);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservSearch: function(param) {
		return new Promise(function(resolve, reject) {
			var searchQuery = "SELECT * FROM acha.ReservLeftJoinUser WHERE storeUUID = ? and (reservName = ? or phoneNumberHash = ? or  (reservTime >= ? AND reservTime < ?) or (? < ADDTIME(reservTime , SEC_TO_TIME(reservTimeSpanMin * 60)) and ? > ADDTIME(reservTime , SEC_TO_TIME(reservTimeSpanMin * 60))))";
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
			var searchQuery = 'SELECT * FROM ReservLeftJoinUser WHERE reservUUID = ? and storeUUID = ?';

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
			var selectQuery = "SELECT * FROM StoreSetting WHERE storeUUID = ?";

			sql.select(selectQuery, [storeUUID]).then(function(result) {
				// 질의문에 + 0 하는 이유는 1, 10, 11, 12 ..., 2, 3, 4 하는걸 방지하기 위함
				return Promise.all([sql.select('SELECT targetName, targetNumber, targetMemo FROM acha.Targets WHERE storeUUID = UNHEX(?) ORDER BY targetName asc', [storeUUID]), result[0]]);
			}).then(function(result) {
				//console.log('솔팅', result[0]);
				//console.log('정렬 전', result[1]);
				result[1].targets = result[0];

				resolve(result[1]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	settingTarget: function(storeUUID, targets) {
		return new Promise(function(resolve, reject) {

			// 기존 테이블 제거 후 덮어쒸우기
			var deleteTargets = 'DELETE FROM Targets WHERE storeUUID = UNHEX(?)';
			sql.delete(deleteTargets, [storeUUID]).then(function() {
				var promiseArr = [];

				for(var i = 0; i < targets.length; i++)
				{
					var target = targets[i];

					var insertTargets = 'INSERT INTO Targets (storeUUID, targetName, targetNumber, targetMemo) VALUES(UNHEX(?), ?, ?, ?)';
					promiseArr.push(sql.insert(insertTargets, [storeUUID, target.targetName, target.targetNumber, target.targetMemo]));
				}

				return Promise.all(promiseArr);
			}).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	settingAlarm: function(storeUUID, firstAlarm, secondAlarm) {
		return new Promise(function(resolve, reject) {
			var updateQuery = 'INSERT INTO AlarmTalkInterval (storeUUID, firstAlarm, secondAlarm) VALUES (UNHEX(?), ?, ?) ON DUPLICATE KEY UPDATE firstAlarm = ?, secondAlarm = ?';

			sql.update(updateQuery, [storeUUID, firstAlarm, secondAlarm, firstAlarm, secondAlarm]).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	settingReservTime: function(storeUUID, reservTime) {
		return new Promise(function(resolve, reject) {
			var updateQuery = 'UPDATE Store SET defaultReservTimeSpanMin = ? WHERE storeUUID = UNHEX(?)';
			sql.update(updateQuery, [reservTime, storeUUID]).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	storeSetting: function(storeUUID)
	{

	},

	reservSetting: function(storeUUID, defResTimeSpan, tabDisplayTime, resNameReq)
	{
		return new Promise(function(resolve, reject) {
			var updateQuery = 'INSERT INTO Setting (storeUUID, defaultReservTimeSpanMin, tableDisplayTime, reservNameReq) VALUES (UNHEX(?), ?, ?, ?) ON DUPLICATE KEY UPDATE defaultReservTimeSpan = ?, tableDisplayTime = ?, reservNameReq = ?';
			sql.update(updateQuery, [storeUUID, defResTimeSpan, tabDisplayTime, resNameReq, defResTimeSpan, tabDisplayTime, resNameReq]).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},



	userStatisticsInfo: function(_storeUUID, _phoneNumberHash) {
		return new Promise(function(resolve, reject) {
			// 전체는 예약횟수랑, 노쇼만 보여주고 매장은 다보여줌
			var selectUserPhoneNumberToUUID = "SELECT count(1) as totalReservCnt, count(CASE WHEN reservStatus = 'noshow' THEN 1 END) as totalNoshowCnt, count(CASE WHEN storeUUID = ? THEN 1 END) as storeReservCnt, count(CASE WHEN reservStatus = 'visit' and storeUUID = ? THEN 1 END) as storeVisitCnt, count(CASE WHEN reservStatus = 'usercancel' and storeUUID = ? THEN 1 END) as storeUserCancelCnt, count(CASE WHEN reservStatus = 'noshow' and storeUUID = ? THEN 1 END) as storeNoshowCnt FROM ReservLeftJoinUser WHERE phoneNumberHash = ?";

			sql.select(selectUserPhoneNumberToUUID, [_storeUUID, _storeUUID, _storeUUID, _storeUUID, _phoneNumberHash]).then(function(rows) {
				var resultJson = {
					totalReservCnt: 0,
					totalNoshowCnt: 0,
					storeReservCnt: 0,
					storeVisitCnt: 0,
					storeUserCancelCnt: 0,
					storeNoshowCnt: 0
				};

				if(rows.length == 0)
					resolve(resultJson);
				else
					resolve(rows[0]);

			}).catch(function(error) {
				reject(error);
			});
		});
	}

}
