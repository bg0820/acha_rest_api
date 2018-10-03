var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mongo = require('../../../MongoDB');
var mapper = require('../../../DB/mapperController.js');
var ObjectId = require('mongodb').ObjectID;

exports.login = function(req, res) {
    var _id = req.body.id;
	var _pw = req.body.pw;
	if(_pw)
	{
		_pw = util.saltHash(_pw);
		req.body.pw = _pw;
	}

	// 값이 둘다 있어야함
	if(!_id && !_pw)
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

	mapper.store.storeLogin(_id, _pw).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '로그인 성공', token: result[0], storeInfo: result[1] });
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});
/*
	// TODO : 가게 정보 로그인시에 안주는걸로 description
	mongo.findOne('Store', { id: _id, pw: _pw }, {_id: 1, storeName: 1, phoneNumber: 1, ceoPhoneNumber: 1, address: 1, roadAddress: 1, detailAddress: 1}).then(function(result) {
		if(!result) // 존재하지 않는 아이디
			throw 200;

		// 토큰 존재 여부 검사
		return Promise.all([mongo.findOne('Token', {storeId: ObjectId(result._id)}, {token: 1}), result]);
	}).then(function(result) {
		var _token = result[1]._id + '-' + Number(new Date());

		if(!result[0]) // Token 발행이 처음인경우 Token 발행
			return Promise.all([mongo.update('Token', { storeId: ObjectId(result[1]._id) }, { $set: {token: _token} }, { upsert: true }), _token, result]);
		else // Token 이 있는경우 기존에 있던 Token 전송
			return Promise.all([{}, result[0].token, result[1]]);
	}).then(function(result) {
		// result[1] = 토큰, result[1] = 매장 정보
		res.send({ result : 'success', code: '0', msg: '로그인 성공', token: result[1], storeInfo: result[2]});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

exports.register = function(req, res) {
    var _id = req.body.id;
	var _pw = req.body.pw;
	if(_pw)
	{
		_pw = util.saltHash(_pw);
		req.body.pw = _pw;
	}

    var _key = req.body.registerKey;
	var _storeName = req.body.storeName;
	var _phoneNumber = req.body.phoneNumber;
	if(_phoneNumber)
		_phoneNumber = _phoneNumber.replace(/-/gi, '');
	var _ceoPhoneNumber = req.body.ceoPhoneNumber;
	if(_ceoPhoneNumber)
		_ceoPhoneNumber = _phoneNumber.replace(/-/gi, '');
	var _address = req.body.address;
	var _roadAddress = req.body.roadAddress;
	var _detailAddress = req.body.detailAddress;
	var _entX = req.body.entX;
	var _entY = req.body.entY;

	// 값이 모두 있어야함
	if( !_id || !_pw || !_key ||
		!_storeName || !_phoneNumber || !_ceoPhoneNumber ||
		!_address || !_roadAddress || !_detailAddress ||
		!_entX || !_entY )
	{
		errorProc.errorProcessing(100, res, req);
		return;
	}

    if(!(_key === "33233C0EB2C9CA56566FD7D503F100ABDBE012306B4EB812C3C9E83129E8495D")) {
		errorProc.errorProcessing(101, res, req);
		return;
	}

	var param = [
		_id,
		_pw,
		_storeName,
		_phoneNumber,
		_ceoPhoneNumber,
		_address,
		_roadAddress,
		_detailAddress,
		_entX,
		_entY
	];

	mapper.store.storeRegister(param).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '회원가입 성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});

/*
	mongo.countDocuments('Store', {id: _id}).then(function(result) {
		if(result != 0) // 존재하는 아이디
			throw 300;

		var param = [_id, hash, _storeName, _phoneNumber, _ceoPhoneNumber, _address, _roadAddress, _detailAddress, _entX, _entY];
		var insertQuery = {
			id: _id,
			pw: hash,
			storeName: _storeName,
			phoneNumber: _phoneNumber,
			ceoPhoneNumber: _ceoPhoneNumber,
			address: _address,
			roadAddress: _roadAddress,
			detailAddress: _detailAddress,
			entX: _entX,
			entY: _entY
		};
		//

		return Promise.all([mapper.storeRegister(param), mongo.insert('Store', insertQuery)]);
	}).then(function(result) {
		res.send({ result : 'success', code: '0', msg: '회원가입 성공'});
	}).catch(function(error) {
		errorProc.errorProcessing(error, res, req);
	});*/
};

exports.registerPage = function(req, res) {
    res.render('register.html');
};

exports.registerJuso = function(req, res) {
	var _inputYn = req.body.inputYn;
	var _roadFullAddr = req.body.roadFullAddr;
	var _roadAddrPart1 = req.body.roadAddrPart1;
	var _addrDetail = req.body.addrDetail;
	var _roadAddrPart2 = req.body.roadAddrPart2;
	var _engAddr = req.body.engAddr;
	var _jibunAddr = req.body.jibunAddr;
	var _zipNo = req.body.zipNo;
	var _admCd = req.body.admCd;
	var _rnMgtSn = req.body.rnMgtSn;
	var _bdMgtSn = req.body.bdMgtSn;
	var _detBdNmList = req.body.detBdNmList;
	var _bdNm = req.body.bdNm;
	var _bdKdcd = req.body.bdKdcd;
	var _siNm = req.body.siNm;
	var _sggNm = req.body.sggNm;
	var _emdNm = req.body.emdNm;
	var _liNm = req.body.liNm;
	var _rn = req.body.rn;
	var _udrtYn = req.body.udrtYn;
	var _buldMnnm = req.body.buldMnnm;
	var _buldSlno = req.body.buldSlno;
	var _mtYn = req.body.mtYn;
	var _lnbrMnnm = req.body.lnbrMnnm;
	var _lnbrSlno = req.body.lnbrSlno;
	var _mtYn = req.body.mtYn;
	var _emdNo = req.body.emdNo;
	var _entX = req.body.entX;
	var _entY = req.body.entY;

	res.render('jusoPopup.html', {
		inputYn: _inputYn,
		roadFullAddr: _roadFullAddr,
		roadAddrPart1: _roadAddrPart1,
		addrDetail: _addrDetail,
		roadAddrPart2: _roadAddrPart2,
		engAddr: _engAddr,
		jibunAddr: _jibunAddr,
		zipNo: _zipNo,
		admCd: _admCd,
		rnMgtSn: _rnMgtSn,
		bdMgtSn: _bdMgtSn,
		detBdNmList: _detBdNmList,
		bdNm: _bdNm,
		bdKdcd: _bdKdcd,
		siNm: _siNm,
		sggNm: _sggNm,
		emdNm: _emdNm,
		liNm: _liNm,
		rn: _rn,
		udrtYn: _udrtYn,
		buldMnnm: _buldMnnm,
		buldSlno: _buldSlno,
		mtYn: _mtYn,
		lnbrMnnm: _lnbrMnnm,
		lnbrSlno: _lnbrSlno,
		mtYn: _mtYn,
		emdNo: _emdNo,
		entX: _entX,
		entY: _entY
	});
};
