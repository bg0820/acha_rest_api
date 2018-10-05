const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');

exports.targetSetting = function(req, res) {
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	// 테이블 목록
	 var _targets = req.body.targets;

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.settingTarget(_storeId, _targets);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '업데이트 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
},

exports.alarmSetting = function(req, res) {
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	// 알림톡 목록
	var _alarmInterval = req.body.alarmInterval;

	// 알림 주기 개수가 2개 이상인경우 오류메시지
	if(_alarmInterval.length > 2)
	{
		errorProc.errorProcessing(600, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.settingAlarm(_storeId, _alarmInterval.first, _alarmInterval.second);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '업데이트 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
},

exports.defaultReservTimeSpanMinSetting = function(req, res) {
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	// 기본 예약 시간 주기
	var _defaultReservTimeSpanMin = req.body.reservTime;

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.settingReservTime(_storeId, _defaultReservTimeSpanMin);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '업데이트 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
},

exports.settingGET = function(req, res) {
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
		return mapper.store.settingGET(_storeId);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', storeInfo: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
