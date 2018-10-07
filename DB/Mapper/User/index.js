const sql = require('../../sql.js');
const log = require('../../../Util/Log');

module.exports = {
	userRegister: function(phoneNumber, phoneNumberHash, kakaoUserKey) {
		return new Promise(function(resolve, reject) {
			// 삽입후 phoneNumberHash 있으면 UPDATE
			var insertQuery = "INSERT INTO User (userUUID, phoneNumberHash, phoneNumber, kakaoUserKey) VALUES (UNHEX(REPLACE(UUID(),'-',\"\")), COALESCE(?, phoneNumberHash), COALESCE(?, phoneNumber), COALESCE(?, kakaoUserKey)) ON DUPLICATE KEY UPDATE phoneNumberHash = COALESCE(?, phoneNumberHash), phoneNumber = COALESCE(?, phoneNumber), kakaoUserKey = COALESCE(?, kakaoUserKey)";

			sql.insert(insertQuery, [phoneNumberHash, phoneNumber, kakaoUserKey, phoneNumberHash, phoneNumber, kakaoUserKey]).then(function(rows) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	userRegisterCheck: function(phoneNumber, kakoUserKey) {
		return new Promise(function(resolve, reject) {
			// 삽입후 phoneNumberHash 있으면 UPDATE
			var selectQuery = 'SELECT EXISTS(SELECT 1 FROM User WHERE phoneNumber = ? or kakaoUserKey = ? LIMIT 1) as count;';

			sql.select(selectQuery, [phoneNumber, kakoUserKey]).then(function(rows) {
				if(rows[0].count == 0) // kakoUserKey 와 phoneNumber 가입되어있음
					resolve(false)
				else
					resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	pushMsg: function(reservUUID) {
		return new Promise(function(resolve, reject) {
			// 삽입후 phoneNumberHash 있으면 UPDATE
			var selectQuery = 'SELECT FcmKey.* FROM acha.FcmKey LEFT JOIN acha.Reserv ON Reserv.storeUUID = FcmKey.storeUUID WHERE Reserv.reservUUID = UNHEX(?)';

			sql.insert(selectQuery, [reservUUID]).then(function(rows) {

				var returnArr = [];

				for(var i = 0; i< rows.length; i++)
					returnArr.push(rows[i].fcmKey);

				resolve(returnArr);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservSearch: function(param) {
		return new Promise(function(resolve, reject) {
			// reserved 조회한 시간 - 1시간 이후 예약만
			var selectQuery = 'SELECT * FROM acha.ReservLookupLeftJoinStore WHERE (kakaoUserKey = ? or phoneNumberHash = ?) and reservStatus = ? and reservTime >= ?';

			sql.select(selectQuery, param).then(function(rows) {
				resolve(rows);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	getReservStatus: function(reservUUID, reservToken) {
		return new Promise(function(resolve, reject) {
			var selectQuery = 'SELECT reservStatus, HEX(reservUUID) as reservUUID FROM Reserv WHERE reservUUID = HEX(?) or reservToken = ?';

			sql.select(selectQuery, [reservUUID, reservToken]).then(function(rows) {
				if(rows.length == 0)  // 예약이 존재하지 않는경우
					throw 800;

				resolve(rows[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	reservUserSetName: function(reservUUID, name) {
		return new Promise(function(resolve, reject) {
			var selectQuery = 'SELECT HEX(userUUID) as userUUID FROM Reserv WHERE userUUID = UNHEX(?)';

			sql.select(selectQuery, [reservUUID]).then(function(rows) {
				if(rows.length == 0)
					throw 800;

				return sql.update('UPDATE User SET name = ? WHERE userUUID = UNHEX(?)', [rows[0].userUUID, name]);
			}).then(function(result) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	}
}
