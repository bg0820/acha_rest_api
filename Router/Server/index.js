const router = require('express').Router();
const pushController = require('./Push/controller');
const testController = require('./Test/controller');

router.get('/test', testController.test);
router.get('/userinit', testController.userInit);
/*router.post('/push', pushController.push);*/

module.exports = router;
