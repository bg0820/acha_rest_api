const router = require('express').Router();
const authController = require('./Auth/controller');
const reservController = require('./Reserv/controller');
const settingController = require('./Setting/controller');
const fcmController = require('./Fcm/controller');
const userController = require('./User/controller');
const pushController = require('./Push/controller');

// 계정 관련
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/registerpage', authController.registerPage);

// fcm
router.post('/fcm', fcmController.fcmPOST);
router.get('/fcm', fcmController.fcmGET);

// 주소 팝업
router.get('/registerJuso', authController.registerJuso);
router.post('/registerJuso', authController.registerJuso);

// 예약
router.post('/reserv', reservController.reservation);
router.get('/reserv/search', reservController.reservationSearch);
router.post('/reserv/edit', reservController.reservationEdit);
router.get('/reserv/edit/status', reservController.reservationStatusEdit);
router.get('/reserv/dateSearch', reservController.reservationDateSearch);
router.get('/reserv/isCheck', reservController.reservTableExistsCheck);
router.get('/reserv/inquery', reservController.reservInQuery);

// 세팅
router.post('/setting/targets', settingController.targetSetting);
router.post('/setting/alarm', settingController.alarmSetting);
router.post('/setting/reservTime', settingController.defaultReservTimeSpanMinSetting);
router.get('/setting', settingController.settingGET);

// 고객
router.get('/user/info', userController.info);

router.get('/push', pushController.getNotification);

module.exports = router;
