var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mapper = require('../../../DB/mapperController.js');
var mongo = require('../../../MongoDB');
var ObjectId = require('mongodb').ObjectID;

exports.reg = function(req, res) {
	// TODO : 폰번호가 등록안되있으면 폰번호 까지 등록
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

	var updateFilterQuery = { phoneNumberHash: _phoneNumberHash };
	var updateQuery = { $set: {phoneNumberHash: _phoneNumberHash, phoneNumber: _phoneNumber, kakaoUserKey: _kakaoUserKey } };
	var updateOption = { upsert: true };

	mongo.updateOne('User', updateFilterQuery, updateQuery, updateOption).then(function(result) {
		res.send({ result : 'success', code: '0',  msg: ''});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

exports.regCheck = function(req, res) {
	var _key = req.query.key;
	var _kakaoUserKey = req.query.kakaoUserKey;

	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	mongo.findOne('User', {kakaoUserKey: _kakaoUserKey}).then(function(result) {
		if(result) // 카카오 유저키 가입되어있음
			res.send({ result : 'success', code: '0', msg: '', isReg: true});
		else
			res.send({ result : 'success', code: '0',  msg: '', isReg: false});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
