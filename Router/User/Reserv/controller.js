var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mapper = require('../../../DB/mapperController.js');

var mongo = require('../../../MongoDB');
var ObjectId = require('mongodb').ObjectID;

// 사용자 예약 검색
exports.reservationSearch = function(req, res) {
	var _key = req.query.key;
	var _kakaoUserKey = req.query.kakaoUserKey;
	var _phoneNumber = req.query.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	// 둘중 하나라도 값이 있어야함
	if(!(_kakaoUserKey || _phoneNumber))
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.user.reservSearch([_kakaoUserKey, _phoneNumberHash, 'reserved', new Date(currentTimestamp - 3600000)]).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', reservList: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
	
/*
	// 값이 있을경우에만 or 연산
	var orArray = [];

	if(_kakaoUserKey)
		orArray.push({ kakaoUserKey: _kakaoUserKey });
	if(_phoneNumber)
		orArray.push({ phoneNumber: _phoneNumber });

	var currentTimestamp = Number(new Date());

	// 사용자 찾기 ->
	// 예약 리스트 가져와서 에약 조회
	// 예약 가져온것에서 매장 가져와서 매장 정보 조회
	var aggregateQuery = [
		{ $match: { $or: orArray } },
		{ $lookup:
			{
				from: 'Reserv',
				localField: '_id',
				foreignField: 'userId',
				as: 'reserv'
			}
		},
		{ $unwind: '$reserv'},
		{ $lookup:
			{
				from: 'Store',
				localField: 'reserv.storeId',
				foreignField: '_id',
				as: 'store'
			}
		},
		{ $unwind: '$store'},
		{ $project: {
			'store.storeName': 1,
			'store.address': 1,
			'store.roadAddress': 1,
			'store.detailAddress': 1,
			'store.phoneNumber': 1,
			'reserv._id': 1,
			'reserv.reservTime': 1,
			'reserv.reservNumber': 1,
			'reserv.name': 1,
			'reserv.currentStatus': 1
		} },
		{ $match : { // reserved 되있으면서 현재시간보다 한시간 전 이후의 예약들에 대한 값들을 가져옴
			$and: [
				{ 'reserv.currentStatus': 'reserved' },
				{ 'reserv.reservTime': { $gte: new Date(currentTimestamp - 3600000) } } // 현재시간 - 1시간
			]
		}}
	];

	mongo.aggregate('User', aggregateQuery, {}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', reservList: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
	*/
};

// 예약 아이디와, 예약 상태를 주면 예약 상태 수정
exports.reservationStatusEdit = function(req, res) {
	var _key = req.query.key;
	var _reservId = req.query.reservId;
	var _status = req.query.status;
	if(_status)
		_status = _status.toLowerCase();

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}
	mapper.common.updateStatistics(_reservId, _status, 'User', null).then(function(result) {
		res.send({ result : 'success', code: '0', msg: ''});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

	/*mongo.updateStatistics(_reservId, _status, 'User', null).then(function(result) {
		res.send({ result : 'success', code: '0', msg: ''});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};


// 토큰 주면 -> 상태코드 줌
exports.getReservStatus = function(req, res) {
	var _key = req.query.key;
	var _reservToken = req.query.reservToken;
	var _reservId = req.query.reservId;

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	// reservToken 또는 reservUUID 를 통해서 예약 상태를 가져옴
	mapper.user.getReservStatus(_reservId, _reservToken).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', statusCode: result.reservStatus,  reservId: result.UUID});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
	/*
	var query = {
		$or: [
			{reservToken: _reservToken},
			{_id: _reservId}
		]
	};

	// 예약 고유번호, 예약 상태 넘겨줌
	mongo.findOne('Reserv', query).then(function(result) {
		if(!result) // 예약이 존재하지 않는경우
			throw 800;

		var userUpdatePromise = mongo.update('User', {_id: ObjectId(result.userId)}, {$set: {kakaoUserKey: _kakaoUserKey, phoneNumber: _phoneNumber}});
		var reservUpdatePromise = mongo.update('Reserv', {reservToken: _reservToken}, {$set: {phoneNumber: _phoneNumber}}, {upsert: false});
		// 예약이 존재한다면, 고객 카카오키 등록
		return Promise.all([userUpdatePromise, reservUpdatePromise, result]);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '카카오 유저키 등록 완료', statusCode: result[1].currentStatus,  reservId: result[1]._id});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

exports.userSetName = function(req, res)
{
	var _key = req.query.key;
	var _name = req.query.name;
	var _reservId = req.query.reservId;

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	mapper.user.reservUserSetName(_reservId, _name).then(function() {
		res.send({result: 'success', code: '0', msg: ''});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

	/*
	mongo.findOne('Reserv', {_id: ObjectId(_reservId)}, {userId: 1}).then(function(result) {
		var reservUpdatePromise = mongo.updateOne('Reserv', {_id: ObjectId(_reservId)}, {$set: {name: _name}}, {upsert: false});
		var userUpdatePromise = mongo.updateOne('User', {_id: ObjectId(result.userId)}, {$set: {name: _name}}, {upsert: false});

		return Promise.all([reservUpdatePromise, userUpdatePromise]);
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: ''});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
}
/*
exports.reservIdToCurrentStatus = function(req, res)
{
	var _key = req.query.key;
	var _reservId = req.query.reservId;

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	mongo.findOne('Reserv', {_id: ObjectId(_reservId)}, {currentStatus: 1}).then(function(result) {
		if(!result)
			throw 900;

		return result.currentStatus;
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: '', currentStatus: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
}
*/
exports.preOrder = function(req, res)
{
	res.render('pre-order.html');
}
