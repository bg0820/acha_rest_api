const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');
const mapper = require('../../../DB/mapperController.js');
const jConfig = require('../../../serverConfig.json');
let count = 0;

function generateReservToken()
{
	// 시간 + '-' + 고객 뒷번호 4자리
	var tokenDate = new Date();
	var monthStr = util.zeroFormating(tokenDate.getMonth() + 1, 2);
	var dayStr = util.zeroFormating(tokenDate.getDate(), 2);
	var hourStr = util.zeroFormating(tokenDate.getHours(), 2);
	var minuteStr = util.zeroFormating(tokenDate.getMinutes(), 2);
	var secondStr = util.zeroFormating(tokenDate.getSeconds(), 2);
	// 1초에 9999건 처리 가능
	if(count == 9999)
		count = 0;
	var countStr = util.zeroFormating(count++, 4);

	return (tokenDate.getYear() % 100).toString() + monthStr.toString() + dayStr.toString() + hourStr.toString() + minuteStr.toString() + secondStr.toString() + countStr.toString();
}

exports.reservation = function(req, res) {
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _phoneNumber = req.body.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}
	var _reservNumber = req.body.reservNumber;
	var _reservTime = req.body.reservTime;
	var _reservTimeSpanMin = req.body.reservTimeSpanMin;
	var _name = req.body.name;
	if(_name)
		_name = _name.trim(); // 이름 공백제거
	else
		_name = "";
	var _reservTarget = util.arrayToString(req.body.reservTarget);
	var _memo = req.body.memo;
	if(!_memo)
		_memo = "";

	// 값이 모두 있어야함, 매니저와 메모 값은 없어도 됌
	if(!_token || !_phoneNumber || !_reservNumber ||
	   !_reservTime || (_reservTarget.length == 0)  || !_reservTimeSpanMin)
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	// TODO: reservTimeSpanMin 이 들어왔을때 테이블이 잡혀있는지 확인해야함
	// 현재시간보다 1시간 전의경우
	if(_reservTime < new Date(Number(new Date - 3600000)))
	{
		errorProc.errorProcessing(400, res, req);
		return;
	}

	// 예약 고유번호 생성
	var reservToken = generateReservToken();
	var reservUUID;

	mapper.store.tokenCheck(_token).then(function(result) {
		// 사용자 생성
		return mapper.store.reservUserCreate(_phoneNumber, _phoneNumberHash, _name);
	}).then(function(userUUID) {
		var insertQuery = [
			userUUID,
			_storeId,
			_name,
			_reservNumber,
			new Date(Number(_reservTime)),
			_reservTimeSpanMin,
			_reservTarget,
			_memo,
			reservToken
		];

		// 예약 내용 insert
		return mapper.store.reserv(insertQuery, reservToken);
	}).then(function(result) {
		reservUUID = result.reservUUID;

		var param = {
			reservId: reservUUID,
			reservName: _name,
			reservNumber: _reservNumber,
			phoneNumber: _phoneNumber,
			reservDate: _reservTime,
			reservToken: reservToken,
			storeName: result.storeName,
			storePhoneNumber: result.storePhoneNumber
		};

		// 알림톡 서버로 예약 정보 넘겨주면 사용자 카카오톡으로 메시지 전송
		return util.requestPost('http://' + jConfig.host + ':' + jConfig.alarmTalkPort + '/reserv/regist', param);
	}).then(function(result) {
		// 예약 상태 업데이트
		return mapper.common.updateStatistics(reservUUID, 'reservwait', 'Store', null);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '', _id: reservUUID });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

// 예약 시간에 대한 테이블에 예약 존재 체크
exports.reservTableExistsCheck = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	// startTime
	var _startTime = new Date(Number(req.query.startTime));
	var start = new Date(_startTime.getFullYear(), _startTime.getMonth(), _startTime.getDate(), _startTime.getHours(), _startTime.getMinutes(), 0);
	// endTime
	var _endTime = new Date(Number(req.query.endTime));
	var end = new Date(_endTime.getFullYear(), _endTime.getMonth(), _endTime.getDate(), _endTime.getHours(), _endTime.getMinutes(), 0);

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.reservTableExistsCheck(_storeId, start, end);
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: '', reservedTableList: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
}

/* indexLoad 할때 쓰임 */
exports.reservationSearch = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _startDate = new Date(Number(req.query.startDate)); // timestamp
	var _endDate = new Date(Number(req.query.endDate)); // timestamp
	var _phoneNumber = req.query.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}
	var _name = req.query.name;
	if(_name)
		_name = _name.trim(); // 이름 공백제거


	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.reservSearch([_storeId, _name, _phoneNumberHash, _startDate, _endDate, _startDate, _endDate]);
	}).then(function(result) {
		for(var i = 0 ; i < result.length; i++)
			result[i].reservTarget = util.stringToArray(result[i].reservTarget);

		res.send({ result: 'success', code: '0', msg: '', reservList: result})
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

exports.reservationStatusEdit = function(req, res)
{
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _reservId = req.query.reservId;
	var _status = req.query.status;
	if(_status)
		_status = _status.toLowerCase();
	var _reason = req.query.reason;
	var param = null;

	// 값이 모두 있어야함, 이름은 없어도 가능
	if( !_reservId || !_token || !_status )
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		if(_status == 'storecancel')
			param = { reason: _reason };

		return mapper.common.updateStatistics(_reservId, _status, 'Store', param);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

}

exports.reservationEdit = function(req, res) {
	// var objForUpdate = {};
	var _token = req.body.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _reservId = req.body.reservId;
	/*var _phoneNumber = req.body.phoneNumber;
	var _phoneNumberHash;
	if(_phoneNumber)
	{
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	    _phoneNumberHash = util.saltHash(_phoneNumber);
	}*/

	// 값이 모두 있어야함, 이름은 없어도 가능
	if( !req.body.token || !req.body.reservId )
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.tokenCheck(_token).then(function(result) {
		var updateParam = [
			req.body.reservNumber,
			new Date(Number(req.body.reservTime)),
			req.body.reservName,
			util.arrayToString(req.body.reservTarget),
			req.body.reservTimeSpanMin,
			req.body.memo,
			_reservId
		];

		return mapper.store.reservEdit(updateParam);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '예약 수정 완료'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
};

// 예약 내용 조회
exports.reservInQuery = function(req, res) {
	var _token = req.query.token;
	var _storeId;
	if(_token)
		_storeId = _token.split('-')[0];
	var _reservId = req.query.reservId;

	mapper.store.tokenCheck(_token).then(function(result) {
		return mapper.store.reservInQuery(_reservId, _storeId);
	}).then(function(result) {
		res.send({result: 'success', code: '0', msg: '', reserv: result});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
}
