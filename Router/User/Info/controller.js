const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');

exports.register = function(req, res) {
	// DONE - DONE : 폰번호가 등록안되있으면 폰번호 까지 등록
	var _key = req.query.key;
	var _phoneNumber = req.query.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
		_phoneNumberHash = util.saltHash(_phoneNumber);
	}
	var _kakaoUserKey = req.query.kakaoUserKey;

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	mapper.user.userRegister(_phoneNumber, _phoneNumberHash, _kakaoUserKey).then(function(result) {
		res.send({ result : 'success', code: '0',  msg: ''});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

// register 하기전에는 무조건 false, register 이후 무조건 true
exports.regCheck = function(req, res) {
	var _key = req.query.key;
	var _kakaoUserKey = req.query.kakaoUserKey;
	var _phoneNumber = req.query.phoneNumber;

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	mapper.user.userRegisterCheck(_phoneNumber, _kakaoUserKey).then(function(result) {
		if(result) // 카카오 유저키 가입되어있음
			res.send({ result : 'success', code: '0', msg: '', isReg: true});
		else
			res.send({ result : 'success', code: '0',  msg: '', isReg: false});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
