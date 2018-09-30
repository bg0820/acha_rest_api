var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mongo = require('../../../MongoDB');
var ObjectId = require('mongodb').ObjectID;
var Notification = require('../../../Notification');

// user/push
exports.pushMsg = function(req, res)
{
	var _key = req.body.key;
	//var _storeId = req.query.storeId;
	var _reservId = req.body.reservId;
	var _status = req.body.status;
	var _msg = req.body.msg;


	if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	mongo.findOne('Reserv', {_id: ObjectId(_reservId)}, {storeId: 1}).then(function(result) {
		return mongo.findOne('Store', {_id: ObjectId(result.storeId)}, {_id: 0, fcmKeyList: 1});
	}).then(function(result) {
		var msgData = {
			reservId: _reservId,
			changeStatus: _status,
			title: _msg.title,
			content: _msg.content
		}

		Notification.mobileFcmPush('User', result.fcmKeyList, _msg.title, _msg.content);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
}
