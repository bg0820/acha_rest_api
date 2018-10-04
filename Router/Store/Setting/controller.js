const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');

exports.settingPOST = function(req, res) {
    var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	// 테이블 목록
    var _tables = req.body.tables;
	// 알림톡 목록
	var _alarmInterval = req.body.alarmInterval;
	if(_alarmInterval)
		alaramIntervalArr = util.stringToArray(_alarmInterval);
	var _defaultReservTimeSpanMin = req.body.defaultReservTimeSpanMin;
	// 알림 주기 개수가 3개 이상인경우 오류메시지
	if(alaramIntervalArr.length > 2)
	{
		errorProc.errorProcessing(600, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.settingPOST(_alarmInterval, _tables, _defaultReservTimeSpanMin, _storeId);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '업데이트 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

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
		// 배열로 만들기
		result.targets = util.stringToArray(result.targets);
		result.alarmTalkInterval = util.stringToArray(result.alarmTalkInterval);

		res.send({ result : 'success', code: '0', msg: '', storeInfo: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
