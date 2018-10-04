var util = require('../../../Util');
var log = require('../../../Util/Log');
var errorProc = require('../../../Util/Error');

var mapper = require('../../../DB/mapperController.js');

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
