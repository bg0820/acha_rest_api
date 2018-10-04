

exports.test = function(req, res) {



	res.send('sad');
};

exports.userInit = function(req, res) {
	/*var _phoneNumber = req.query.phoneNumber;
	var updateQuery = {
		$unset: { reservList: 1 },
		$set: {
			totalReservCnt: 0,
			totalReservedCnt: 0,
			totalUserCancelCnt: 0,
			totalStoreCancelCnt: 0,
			totalVisitCnt: 0,
			totalNoshowCnt: 0
		}};

	mongo.findOne('User', {phoneNumber: _phoneNumber}, {_id: 1}).then(function(result) {
		console.log(result);
		if(!result)
			throw 100;

		mongo.remove('Reserv', {userId: ObjectId(result._id)});

		return mongo.updateOne('User', {phoneNumber: _phoneNumber}, updateQuery, {upsert: false})
	}).then(function(result) {
		res.send('success');
	}).catch(function(error) {
		res.send('failed');
		console.log(error);
	});*/

}
