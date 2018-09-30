var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mongo = require('../../../MongoDB');
var mapper = require('../../../DB/mapperController.js');


var ObjectId = require('mongodb').ObjectID;

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

	mapper.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mapper.store.fcmGET(_storeId);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: 'fcmKeyList 가져오기 완료', fcmList: result.fcmKeyList });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
	/*

	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mongo.findOne('Store', {_id: ObjectId(_storeId)}, { fcmKeyList: 1, _id: 0});
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: 'fcmKeyList 가져오기 완료', fcmList: result.fcmKeyList});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
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

	mapper.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mapper.store.fcmPOST(_storeId, _fcmKey);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: 'fcmKeyList 가져오기 완료', response: { fcmKeyList: result.fcmKeyList } });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mongo.updateOne('Store', {_id: ObjectId(_storeId)}, { $addToSet: {fcmKeyList: _fcmKey}}, {upsert: false});
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: 'fcmKey 등록 완료', fcm: _fcmKey});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};
