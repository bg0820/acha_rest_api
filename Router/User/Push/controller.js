const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');
const Notification = require('../../../Notification');

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

	mapper.user.pushMsg(_reservId).then(function(result) {
		var msgData = {
			reservId: _reservId,
			changeStatus: _status,
			title: _msg.title,
			content: _msg.content
		}

		Notification.mobileFcmPush('User', result, _msg.title, _msg.content);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
}
