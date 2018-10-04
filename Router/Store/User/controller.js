const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');

exports.info = function(req, res) {
    var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _phoneNumber = req.query.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.userStatisticsInfo(_storeId, _phoneNumberHash);
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: '', userInfo: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};
