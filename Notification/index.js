var socketIo = require('./socket.js');
var fcm = require('./firebase.js');

module.exports = {
	pcPushData: function(storeUUID, msgData)
	{
		// 매장에서 수정해도 socket 으로는 보냄
		var sock = socketIo.getStoreIdToSocketArr(storeUUID);
		if(sock)
		{
			for(var i = 0 ; i< sock.length; i++)
				sock[i].socket.emit('userStatusChange', msgData);
		}
	},

	mobileFcmPush: function(type, fcmKeyList, title, content)
	{
		// 사용자가 예약을 변경했을때만 매장에 push
		if(type == 'User' && fcmKeyList)
		{
			// 매장에 SEND
			for(var i = 0; i < fcmKeyList.length; i++)
				fcm.pushMsg(fcmKeyList[i], title, content);
		}
	}
}
