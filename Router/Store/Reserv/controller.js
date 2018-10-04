var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mongo = require('../../../MongoDB');
var mapper = require('../../../DB/mapperController.js');
var ObjectId = require('mongodb').ObjectID;

/*
// 유저 존재 확인후 생성
function userCreate(_phoneNumber, _phoneNumberHash, _name)
{
	return new Promise(function(resolve, reject) {
		mongo.findOne('User', {phoneNumberHash: _phoneNumberHash}).then(function(result) {
			if(result) // 유저가 존재함
				resolve(result._id);
			else // 유저가 존재하지 않음
			{
				var query = {
					phoneNumber: _phoneNumber,
					phoneNumberHash: _phoneNumberHash,
					name: _name
				};
				return mongo.insertOne('User', query);
			}
		}).then(function(result) {
			resolve(result.insertedId);
		}).catch(function(error) {
			reject(error);
		});
	});
}*/

var count = 0;

function generateReservToken()
{
	// 시간 + '-' + 고객 뒷번호 4자리
	var tokenDate = new Date();
	var monthStr = util.zeroFormating(tokenDate.getMonth() + 1, 2);
	var dayStr = util.zeroFormating(tokenDate.getDate(), 2);
	var hourStr = util.zeroFormating(tokenDate.getHours(), 2);
	var minuteStr = util.zeroFormating(tokenDate.getMinutes(), 2);
	var secondStr = util.zeroFormating(tokenDate.getSeconds(), 2);
	// 1초에 9999건 처리 가능
	if(count == 9999)
		count = 0;
	var countStr = util.zeroFormating(count++, 4);

	return (tokenDate.getYear() % 100).toString() + monthStr.toString() + dayStr.toString() + hourStr.toString() + minuteStr.toString() + secondStr.toString() + countStr.toString();
}

exports.reservation = function(req, res) {
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _phoneNumber = req.body.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}
	var _reservNumber = req.body.reservNumber;
	var _reservTime = req.body.reservTime;
	var _reservTimeSpanMin = req.body.reservTimeSpanMin;
	var _name = req.body.name;
	if(_name)
		_name = _name.trim(); // 이름 공백제거
	else
		_name = "";
	var _tableName = req.body.tableName;
	var _memo = req.body.memo;
	if(!_memo)
		_memo = "";

	// 값이 모두 있어야함, 매니저와 메모 값은 없어도 됌
	if(!_token || !_phoneNumber || !_reservNumber ||
	   !_reservTime || !_tableName || !_reservTimeSpanMin)
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	// 현재시간보다 1시간 전의경우
	if(_reservTime < new Date(Number(new Date - 3600000)))
	{
		errorProc.errorProcessing(400, res, req);
		return;
	}

	// 예약 고유번호 생성
	var reservToken = generateReservToken();
	var reservUUID;

	mapper.store.tokenCheck(_token).then(function(result) {
		// 사용자 생성
		return mapper.store.reservUserCreate(_phoneNumberHash, _name);
	}).then(function(userUUID) {
		var insertQuery = [
			userUUID,
			_storeId,
			_name,
			_reservNumber,
			new Date(Number(_reservTime)),
			_reservTimeSpanMin,
			_tableName,
			_memo,
			reservToken
		];

		// 예약 내용 insert
		return mapper.store.reserv(insertQuery, reservToken);
	}).then(function(result) {
		reservUUID = result.reservUUID;

		var param = {
			reservId: reservUUID,
			reservName: _name,
			reservNumber: _reservNumber,
			phoneNumber: _phoneNumber,
			reservDate: _reservTime,
			reservToken: reservToken,
			storeName: result.storeName,
			storePhoneNumber: result.storePhoneNumber
		};

		// 알림톡 서버로 예약 정보 넘겨주면 사용자 카카오톡으로 메시지 전송
		util.requestPost('http://test.acha.io:5000/reserv/regist', param);

		// 예약 상태 업데이트
		return mapper.common.updateStatistics(reservUUID, 'reservwait', 'Store', null);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', _id: reservUUID });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return userCreate(_phoneNumber, _phoneNumberHash, _name);
	}).then(function(result) {
		var insertQuery = {
			storeId: ObjectId(_storeId),
			userId: ObjectId(result),
			phoneNumber: _phoneNumber,
			name: _name,
			reservNumber: _reservNumber,
			reservTime: new Date(Number(_reservTime)),
			tableName: _tableName,
			memo: _memo,
			date:  new Date(),
			reservToken: _reservToken
		};

		return mongo.insertOne('Reserv', insertQuery);
	}).then(function(result) {
		var storePromise = mongo.findOne('Store', {_id: ObjectId(_storeId)});;

		// 매장, 고객 reservList 에 예약 정보 추가
		var storeUpdateQuery = { $addToSet: {reservList: ObjectId(result.insertedId)}};
		var userUpdateQuery = { $addToSet: {reservList: ObjectId(result.insertedId)}};

		var storeUpdatePromise = mongo.update('Stroe', {_id: ObjectId(_storeId)}, storeUpdateQuery, {upsert: false});
		var userUpdatePromise = mongo.update('User', {phoneNumberHash: _phoneNumberHash}, userUpdateQuery, { upsert: false });

		return Promise.all([storePromise, storeUpdatePromise, userUpdatePromise, result.insertedId]);
	}).then(function(result) {
		var _reservId = result[3].toString();
		mongo.updateStatistics(_reservId, 'reservwait', 'Store', null);

		// 알림톡 서버로 예약 정보 넘겨주면 사용자에게 핸드폰번호로 문자 전송
		var parm = {
			reservId: _reservId,
			reservName: _name,
			reservNumber: _reservNumber,
			phoneNumber: _phoneNumber,
			reservDate: _reservTime,
			reservToken: _reservToken,
			storeName: result[0].storeName,
			storePhoneNumber: result[0].phoneNumber
		};

		return Promise.all([util.requestPost('http://test.acha.io:5000/reserv/regist', parm), result[3]]); // 알림톡 서버로 값 보내줌
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', reservId: result[1]});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

// 예약 시간에 대한 테이블에 예약 존재 체크
exports.reservTableExistsCheck = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	// startTime
	var _startTime = new Date(Number(req.query.startTime));
	var start = new Date(_startTime.getFullYear(), _startTime.getMonth(), _startTime.getDate(), _startTime.getHours(), _startTime.getMinutes(), 0);
	// endTime
	var _endTime = new Date(Number(req.query.endTime));
	var end = new Date(_endTime.getFullYear(), _endTime.getMonth(), _endTime.getDate(), _endTime.getHours(), _endTime.getMinutes(), 0);

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.reservTableExistsCheck(_storeId, start, end);
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: '', reservedTableList: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;
	}).then(function() {


		var aggregateQuery = [
			{ $match: { $and: [
				{storeId: ObjectId(_storeId)},
				{reservTime: {$gte: startTime, $lte: endTime}},
				{$or: [
					{currentStatus: 'reservwait'},
					{currentStatus: 'reserved'},
					{currentStatus: 'visit'},
					{currentStatus: 'noshow'}
				]}
			]}},
			{ $project: { tableName: 1, _id: 0 } },
		];

		return mongo.aggregate('Reserv', aggregateQuery);
	}).then(function(result) {
		// 테이블 이름만 가져와서 _reservedTableList 배열에 push 하고 보내줌
		var _reservedTableList = [];
		for(var i = 0; i < result.length; i++)
		{
			var tableName = result[i].tableName;

			for(var j = 0; j < tableName.length; j++)
				_reservedTableList.push(tableName[j]);
		}

		res.send({result: 'success', code: '0', msg: '', reservedTableList: _reservedTableList});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
}


exports.reservationSearch = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _startDate = new Date(Number(req.query.startDate)); // timestamp
	var _endDate = new Date(Number(req.query.endDate)); // timestamp
	var _phoneNumber = req.body.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}
	var _name = req.query.name;
	if(_name)
		_name = _name.trim(); // 이름 공백제거

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.reservSearch([_name, _phoneNumberHash, _startDate, _endDate]);
	}).then(function(result) {
		for(var i = 0 ; i < result.length; i++)
			result[i].reservTarget = util.stringToArray(result[i].reservTarget);

		res.send({ result: 'success', code: '0', msg: '', reservList: result})
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
		/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		// 값이 있을경우에만 or 연산
		var orArray = [];
		if(_name)
			orArray.push({ name: _name });
		if(_phoneNumber)
			orArray.push({ phoneNumber: _phoneNumber });
		if(_startDate && _endDate)
			orArray.push({ reservTime: { '$gte': new Date(Number(_startDate)), '$lt': new Date(Number(_endDate)) }});

		return mongo.find('Reserv', {$and: [{storeId: ObjectId(_storeId)}, {$or: orArray}]});
	}).then(function(result) {
		res.send({ result: 'success', code: '0', msg: '', reservList: result})
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

exports.reservationStatusEdit = function(req, res)
{
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _reservId = req.query.reservId;
	var _status = req.query.status;
	if(_status)
		_status = _status.toLowerCase();
	var _reason = req.query.reason;
	var param = null;

	// 값이 모두 있어야함, 이름은 없어도 가능
	if( !_reservId || !_token || !_status )
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		if(_status == 'storecancel')
			param = { reason: _reason };

		return mapper.common.updateStatistics(_reservId, _status, 'Store', param);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

	/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;
		var param = null;
		if(_status == 'storecancel')
			param = { reason: _reason };
		return mongo.updateStatistics(_reservId, _status, 'Store', param);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
}

exports.reservationEdit = function(req, res) {
	// var objForUpdate = {};
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _reservId = req.body.reservId;
	var _phoneNumber = req.body.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}

	// 값이 모두 있어야함, 이름은 없어도 가능
	if( !req.body.token || !req.body.reservId )
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		var updateParam = [
			req.body.reservNumber,
			new Date(Number(req.body.reservTime)),
			req.body.reservName,
			req.body.tableName,
			req.body.memo,
			_reservId
		];

		return mapper.store.reservEdit(updateParam);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '예약 수정 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
/*
	if(req.body.reservNumber) objForUpdate.reservNumber = req.body.reservNumber;
	if(req.body.phoneNumber) objForUpdate.phoneNumber = req.body.phoneNumber.replace(/-/gi, '');
	// if(req.body.manager) objForUpdate.manager = req.body.manager;
	if(req.body.reservTime) objForUpdate.reservTime = new Date(Number(req.body.reservTime));  // timestamp
	//if(req.body.reservMoney) objForUpdate.reservMoney = req.body.reservMoney;
	if(req.body.name) objForUpdate.name = req.body.name;
	if(req.body.tableName) objForUpdate.tableName = req.body.tableName;
	if(req.body.memo) objForUpdate.memo = req.body.memo;

	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mongo.updateOne('Reserv', {_id: ObjectId(_reservId)}, {$set: objForUpdate}, { upsert: false });
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '예약 수정 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

exports.reservationDateSearch = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _date = req.query.date;

	// 값이 모두 있어야함
	if(!_token || !_date)
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	var queryDate = new Date(Number(_date));
	var today = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
	var todayTimestamp = Number(today);
	var sunDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate() - today.getDay());
	var plus = 6 - today.getDay();
	var satDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate() + plus);
	var tomorrow = 86400000; // 1000(1초) * 60(1분) * 60(1시간) * 24(24시간)

	mapper.store.tokenCheck(_token).then(function(result) {
		/*var weekPromise = mongo.countDocuments('Reserv', { $and: [{storeId: ObjectId(_storeId)}, {reservTime: { '$gte': sunDay, '$lte': satDay } }]});
		var todayPromise = mongo.countDocuments('Reserv', {  $and: [{storeId: ObjectId(_storeId)}, {reservTime: { '$gte': new Date(todayTimestamp), '$lte': new Date(todayTimestamp + tomorrow) }}] });
		var tomorrowPromise = mongo.countDocuments('Reserv', { $and: [{storeId: ObjectId(_storeId)}, {reservTime: { '$gte': new Date(todayTimestamp + tomorrow), '$lte': new Date(todayTimestamp + tomorrow + tomorrow) } }]});

		return Promise.all([weekPromise, todayPromise, tomorrowPromise]);*/
	}).then(function(result) {
		res.send({ result: 'success', code: '0', msg: ''}); //, weekCount: result[0], todayCount: result[1], tomorrowCount: result[2]})
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		var weekPromise = mongo.countDocuments('Reserv', { $and: [{storeId: ObjectId(_storeId)}, {reservTime: { '$gte': sunDay, '$lte': satDay } }]});
		var todayPromise = mongo.countDocuments('Reserv', {  $and: [{storeId: ObjectId(_storeId)}, {reservTime: { '$gte': new Date(todayTimestamp), '$lte': new Date(todayTimestamp + tomorrow) }}] });
		var tomorrowPromise = mongo.countDocuments('Reserv', { $and: [{storeId: ObjectId(_storeId)}, {reservTime: { '$gte': new Date(todayTimestamp + tomorrow), '$lte': new Date(todayTimestamp + tomorrow + tomorrow) } }]});

		return Promise.all([weekPromise, todayPromise, tomorrowPromise]);
	}).then(function(result) {
		res.send({ result: 'success', code: '0', msg: '', weekCount: result[0], todayCount: result[1], tomorrowCount: result[2]})
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

// 예약 내용 조회
exports.reservInQuery = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _reservId = req.query.reservId;

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.reservInQuery(_reservId, _storeId);
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: '', reserv: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;
		return mongo.findOne('Reserv', {$and: [{_id: ObjectId(_reservId)}, {storeId: ObjectId(_storeId)}]}, {userId: 0, date: 0, statusList: 0, reservToken: 0});
	}).then(function(result) {
		if(!result)
			throw 9701;

		res.send({result: 'success', code: '0', msg: '', reserv: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
}
