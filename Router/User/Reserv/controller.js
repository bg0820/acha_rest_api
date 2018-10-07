const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');

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
		res.send({ result : 'success', code: '0', msg: '', statusCode: result.reservStatus,  reservId: result.reservUUID, reservToken: result.reservToken});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

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

}

exports.preOrder = function(req, res)
{
	res.render('pre-order.html');
}
