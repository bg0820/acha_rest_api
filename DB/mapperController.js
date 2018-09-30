const storeMapper = require('./Mapper/Store');
const userMapper = require('./Mapper/User');
const commonMapper = require('./Mapper');

module.exports = function() {
	return {
		store: storeMapper,
		user: userMapper,
		common: commonMapper
	}
}();
