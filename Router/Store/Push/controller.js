var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mapper = require('../../../DB/mapperController.js');

exports.getNotification = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _number = Number(req.query.number);
	var _offset = Number(req.query.offset);

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.common.getNotification(_storeId, _number, _offset);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', alarmList: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
