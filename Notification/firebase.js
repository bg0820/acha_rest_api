var log = require('../Util/Log');
var FCM = require('fcm-node');
var serverKey = 'AAAAIrXWX_c:APA91bGjgGW68VCAmpvdMolzyxvgUURD6NRsCRoGUEvH6c84jk4UagoBZVkMnQvLuWeYnApTpEpHl60NgzKJ_0DGASqYgFzkZdSjFipG-DSdpiVGF4-UWGHWhvRFe5hVWLzuk62SpaNM';

var fcm = new FCM(serverKey);

module.exports = {

	pushMsg: function(clientKey, title, body) {
		// 발송 후 시간 리턴(db에 timestamp 처리하기)
		/** 발송할 Push 메시지 내용 */
		var pushData = {
			// 수신대상
			to: clientKey,
			// App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
			notification: {
				title: title,
				body: body,
				sound: "default",
				click_action: "FCM_PLUGIN_ACTIVITY"
				// icon: "fcm_push_icon"
			}
		};

		fcm.send(pushData, function(err, response) {
			if (err) {
				log.error('fcmSend Error', err);
			}

			log.info(clientKey + ", Push Send");
			// TODO : 발송완료 후 처리
		});
	}
};
