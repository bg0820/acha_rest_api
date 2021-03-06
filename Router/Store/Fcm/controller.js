var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mapper = require('../../../DB/mapperController.js');

exports.fcmGET = function(req, res) {
	var _token = req.query.token;
    var _storeId;
    if(_token)
 	   _storeId = _token.split('-')[0];

	// 값이 모두 있어야함
	if(!_token)
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.fcmGET(_storeId);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: 'fcmKeyList 가져오기 완료', fcmList: result.fcmKeyList });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

exports.fcmPOST = function(req, res) {
	var _token = req.body.token;
    var _storeId;
    if(_token)
 	   _storeId = _token.split('-')[0];
	var _fcmKey = req.body.fcm;

	// 값이 모두 있어야함
	if(!_token || !_fcmKey)
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.fcmPOST(_storeId, _fcmKey);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: 'fcmKeyList 가져오기 완료', response: { fcmKeyList: result.fcmKeyList } });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
