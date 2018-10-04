var HashMap = require('hashmap');
var log = require('../Util/Log');
var mapper = require('../DB/mapperController.js');
var ObjectId = require('mongodb').ObjectID;
var storeSocketList = new HashMap(); // storeId, socket[] // conmap
var storeFindList = new HashMap(); // socket, storeId // revConMap
var _io;

module.exports = {
	// StoreId TO Socket => StoreId -> Socket[]
	getStoreIdToSocketArr: function(storeId) {
		return storeSocketList.get(storeId.toString());
	},

	start: function(io) {
		// 알림보내기 위해서 웹소켓 사용
		io.on('connection', function(socket) {
			// 전체 전달
			// io.sockets.emit('notice', {msg: ''});
			// 개별 전달
			// socket.emit('voteStatus', {});
			socket.on('conn', function(data) {
				var _storeId = data.storeInfo.storeUUID;
				log.connect(_storeId + ', connection()');
				data.socket = socket;

				if(storeSocketList.has(_storeId.toString()))
				{
					// 존재하면 값 가져와서 배열로 소켓 만들어서 넣기
					var socketArr = storeSocketList.get(_storeId.toString());
					socketArr.push(data);
					storeSocketList.delete(_storeId.toString());
					storeSocketList.set(_storeId.toString(), socketArr);
				}
				else // 존재하지 않음
				{
					var socketArr = [];
					// 없다면 새로운 소켓배열 생성해서 넣기
					socketArr.push(data);
					storeSocketList.set(_storeId.toString(), socketArr);
				}

				// 소켓으로 매장 찾을때 사용
				storeFindList.set(socket, _storeId.toString());
			});

			// 매장 프로그램에서 첫 접속시 밀린 알림 요청
			socket.on('getNotification', function(data) {
				console.log('getNotification() ', data);
				if(data)
				{
					// export 밖에 두면 에러나는데 왜그러지...
					// var mongo = require('../MongoDB');
					mapper.common.getNotification(data.storeId, new Date(data.lastTimestamp)).then(function(result) {
						socket.emit('getWaitNotification', result);
					}).catch(function(error) {
						console.log('getNotification() ', error);
					});

					/*mongo.find('Notification', { $and:[{ storeId: ObjectId(data.storeId) }, { date: {$gt: new Date(data.lastTimestamp)} }] }).then(function(result) {
						socket.emit('getWaitNotification', result);
					});*/
				}
			});

			socket.on('disconnect', function() {
				if(storeFindList.has(socket))
				{
					// 연결 종료시 배열에서 disconnect 된 소켓 제거
					// 소켓 하나만 제거후 다시 집어넣음
					var storeId = storeFindList.get(socket).toString();
					var socketArr = storeSocketList.get(storeId.toString());
					// 1번

					for(var i = 0 ; i < socketArr.length; i++)
					{
						if(socketArr[i] == socket)
							socketArr.slice(i, i);
					}
					// 배열에서 제거 한후 다시 제거된 배열 집어넣기
					// 비동기 문제 여지가 있음
					// 예를들어 소켓 배열 꺼내놓은 시점에서 새로운 접속이 연결되었을경우
					// 그 사이에 수정된 배열을 추가하면 새로 접속된 소켓이 해쉬맵에 들어가지 않는 문제
					// 동기화가 필요함
					// 예를들어 1번과 3번 사이에 새로운 접속이 있는경우
					// 3번
					storeSocketList.set(storeId.toString(), socketArr);

					log.connect(storeId + ', disconnect()');
				}
			});
		});
    }
};
