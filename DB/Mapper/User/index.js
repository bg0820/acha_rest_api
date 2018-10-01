const sql = require('../../sql.js');
const log = require('../../../Util/Log');

module.exports = {
	register: function(phoneNumber, phoneNumberHash, kakaoUserKey) {
		return new Promise(function(resolve, reject) {
			// 삽입후 phoneNumberHash 있으면 UPDATE
			var insertQuery = 'INSERT INTO User (phoneNumberHash, phoneNumber, kakoUserKey) VALUES (COALESCE(?, NULL), COALESCE(?, NULL), COALESCE(?, NULL)) ON DUPLICATE KEY UPDATE User SET phoneNumberHash = COALESCE(?, phoneNumberHash), phoneNumber = COALESCE(?, phoneNumber), kakoUserKey = COALESCE(?, kakoUserKey)';
		
			sql.inset(selectQuery, [phoneNumberHash, phoneNumber, kakaoUserKey, phoneNumberHash, phoneNumber, kakaoUserKey]).then(function(rows) {
				resolve(true);
			}).catch(function(error) {
				reject(error);
			});
		});
	},

	getReservStatus: function(reservUUID, reservToken) {
		return new Promise(function(resolve, reject) {
			var selectQuery = 'SELECT reservStatus, HEX(UUID) as UUID FROM Reserv WHERE UUID = HEX(?) or reservToken = ?';

			sql.selectQuery(selectQuery, [reservUUID, reservToken]).then(function(rows) {
				if(rows.length == 0)  // 예약이 존재하지 않는경우
					throw 800;

				resolve(rows[0]);
			}).catch(function(error) {
				reject(error);
			});
		});
	}
}
