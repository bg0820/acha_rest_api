var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mongo = require('../../../MongoDB');
var mapper = require('../../../DB/mapperController.js');
var ObjectId = require('mongodb').ObjectID;

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
		res.send({result: 'success', code: '0', msg: '', userInfo: result });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
/*
	mongo.tokenCheck(_token).then(function(result) {
		if(result) // 에러코드 존재
			throw result;

		return mongo.findOne('User', {phoneNumberHash: _phoneNumberHash}, {_id: 1, totalReservCnt: 1, totalNoshowCnt: 1});
	}).then(function(result) {
		if(result)
			return Promise.all([result, mongo.findOne('Statistics', {$and: [{userId: ObjectId(result._id)}, {storeId: ObjectId(_storeId)}]})]);
		else
			return false;
	}).then(function(result) {
		// 전체 예약 통계
		var _totalReservCnt = 0;
		var _totalNoshowCnt = 0;
		// 특정 매장 통계
		var _storeReservCnt = 0;
		var _storeVisitCnt = 0;
		var _storeCancelCnt = 0;
		var _storeNoshowCnt = 0;

		if(result[0])
		{
			var totalStoreCancel = 0;
			var totalUserCancel = 0;

			if(result[1].totalStoreCancelCnt)
			if(result[0].totalReservCnt)
				_totalReservCnt = result[0].totalReservCnt;
			if(result[0].totalNoshowCnt)
				_totalNoshowCnt = result[0].totalNoshowCnt;

			if(result[1].totalReservCnt)
				_storeReservCnt = result[1].totalReservCnt;
			if(result[1].totalVisitCnt)
				_storeVisitCnt = result[1].totalVisitCnt;

			if(result[1].totalStoreCancelCnt)
				totalStoreCancel = result[1].totalStoreCancelCnt;
			if(result[1].totalUserCancelCnt)
				totalUserCancel = result[1].totalUserCancelCnt;
			_storeCancelCnt = totalStoreCancel + totalUserCancel;

			if(result[1].totalNoshowCnt)
				_storeNoshowCnt = result[1].totalNoshowCnt;

			res.send({result: 'success', code: '0', msg: '', allStoreReserv: { totalReservCnt: _totalReservCnt, totalNoshowCnt: _totalNoshowCnt }, storeReserv: {storeReservCnt: _storeReservCnt, storeVisitCnt: _storeVisitCnt, storeCancelCnt: _storeCancelCnt, storeNoshowCnt: _storeNoshowCnt}});
		}
		else
			res.send({result: 'success', code: '0', msg: '', allStoreReserv: { totalReservCnt: 0, totalNoshowCnt: 0}, storeReserv: {storeReservCnt: 0, storeVisitCnt: 0, storeCancelCnt: 0, storeNoshowCnt: 0} });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};
