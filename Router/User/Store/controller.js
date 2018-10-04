const util = require('../../../Util');
const log = require('../../../Util/Log');
const errorProc = require('../../../Util/Error');

exports.map = function(req, res) {
	res.render('map.html');
};
