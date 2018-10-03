const router = require('express').Router();
const reservController = require('./Reserv/controller');
const infoController = require('./Info/controller');
const storeController = require('./Store/controller');
const pushController = require('./Push/controller');

// 사용자 정보
router.get('/info/reg', infoController.register);
router.get('/info/regCheck', infoController.regCheck);

// 예약
router.get('/reserv/search', reservController.reservationSearch);
router.get('/reserv/edit', reservController.reservationStatusEdit);
router.get('/reserv/getstatus', reservController.getReservStatus);
router.get('/reserv/setname', reservController.userSetName);

//router.get('/reserv/currentStatus', reservController.reservIdToCurrentStatus);

// 미리주문하기
router.get('/reserv/preorder', reservController.preOrder);

// 매장 위치 정보
router.get('/map', storeController.map);

router.post('/push', pushController.pushMsg);



module.exports = router;
