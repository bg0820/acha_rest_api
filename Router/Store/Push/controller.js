var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mapper = require('../../../DB/mapperController.js');

exports.getNotification = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _lastTime = req.query.lastTime;

	mapper.common.getNotification(data.storeId, new Date(data.lastTimestamp)).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', alarmList: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
