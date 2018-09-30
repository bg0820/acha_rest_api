var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mongo = require('../../../MongoDB');
var mapper = require('../../../DB/mapperController.js');


var ObjectId = require('mongodb').ObjectID;

exports.getNotification = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _lastTime = req.query.lastTime;

	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mongo.find('Notification', { $and:[{ storeId: ObjectId(_storeId) }, { date: {$gt: new Date(_lastTime)} }] });
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', reservId: result[1]});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
