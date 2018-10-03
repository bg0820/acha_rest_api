var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Notification = require('../Notification');
var util = require('../Util');
var log = require('../Util/Log');
var url = 'mongodb://acha:achasoma09!!@test.acha.io:27017?authMechanism=SCRAM-SHA-1&authSource=acha';
var _db;

var self = module.exports = {

    // 연결 풀링 - 연결 유지하기(매번 연결할때마다 인증 시간이 소요되는 문제)
    connect: function ()
    {
        MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
           if (err) {
              log.error('MongoDB Connected Failed', err);
              return;
           }
           else {
               log.info('MongoDB Connected');
           }

           _db = db;
        });
    },

    getDB: function()
    {
        return _db;
    },

	getAchaDB: function()
	{
		return _db.db('acha');
	},

    /**
    * @param {string} collection collection name
    * @param {object} query jsonQuery
    */
    findOne: function (coll, query)
    {
		return new Promise(function (resolve, reject) {
	        var dbo = _db.db('acha');
			dbo.collection(coll).findOne(query, function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
		});
	},

	findOne: function (coll, query, projection)
    {
		return new Promise(function (resolve, reject) {
	        var dbo = _db.db('acha');
			dbo.collection(coll).findOne(query, {fields: projection}, function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
		});
	},

	/**
	* @param {string} collection collection name
	* @param {object} query jsonQuery
	*/
	find: function (coll, query)
	{
		return new Promise(function (resolve, reject) {
			var dbo = _db.db('acha');
			dbo.collection(coll).find(query).toArray(function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
		});
	},

	find: function (coll, query, projection)
	{
		return new Promise(function (resolve, reject) {
			var dbo = _db.db('acha');
			dbo.collection(coll).find(query, {fields: projection}).toArray(function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
		});
	},

	remove: function (coll, query)
	{
		return new Promise(function (resolve, reject) {
			var dbo = _db.db('acha');
			dbo.collection(coll).remove(query, function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
		});
	},

    /**
    * @param {string} collection collection name
    * @param {object} query jsonQuery
    */
    insert: function (coll, query)
    {
		return new Promise(function (resolve, reject) {
	        var dbo = _db.db('acha');
	        dbo.collection(coll).insert(query, function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
	   });
   },

   /**
   * @param {string} collection collection name
   * @param {object} query jsonQuery
   */
   insertOne: function (coll, query)
   {
	   return new Promise(function (resolve, reject) {
		   var dbo = _db.db('acha');
		   dbo.collection(coll).insertOne(query, function(err, doc) {
			   if(err)
				   reject(err);
			   else
				   resolve(doc);
		   });
	  });
  },

   /**
   * @param {string} collection collection name
   * @param {object} query jsonQuery
   */
   countDocuments: function(coll, query)
   {
	   return new Promise(function (resolve, reject) {
		   var dbo = _db.db('acha');
		   dbo.collection(coll).countDocuments(query, function(err, doc) {
			   if(err)
				   reject(err);
			   else
				   resolve(doc);
		   });
	  });
   },

   /**
   * @param {string} collection collection name
   * @param {object} query jsonQuery
   * @param {object} update jsonQuery
   * @param {object} options jsonQuery
   */
   update: function(coll, query, update)
   {
	   return new Promise(function (resolve, reject) {
		   var dbo = _db.db('acha');
		   dbo.collection(coll).update(query, update, function(err, doc) {
			   if(err)
				   reject(err);
			   else
				   resolve(doc);
		   });
	   });
   },

   update: function(coll, query, update, options)
   {
	return new Promise(function (resolve, reject) {
		var dbo = _db.db('acha');
		dbo.collection(coll).update(query, update, options, function(err, doc) {
			if(err)
				reject(err);
			else
				resolve(doc);
		});
	});
   },

   /**
   * @param {string} collection collection name
   * @param {object} query jsonQuery
   * @param {object} update jsonQuery
   * @param {object} options jsonQuery
   */
   updateOne: function(coll, query, update)
   {
 	 return new Promise(function (resolve, reject) {
 		 var dbo = _db.db('acha');
 		 dbo.collection(coll).updateOne(query, update, function(err, doc) {
 			 if(err)
 				 reject(err);
 			 else
 				 resolve(doc);
 		 });
 	 });
   },

   updateOne: function(coll, query, update, options)
   {
	  return new Promise(function (resolve, reject) {
		  var dbo = _db.db('acha');
		  dbo.collection(coll).updateOne(query, update, options, function(err, doc) {
			  if(err)
				  reject(err);
			  else
				  resolve(doc);
		  });
	  });
   },

	aggregate: function(coll, pipeline, options)
	{
		return new Promise(function (resolve, reject) {
			var dbo = _db.db('acha');
			dbo.collection(coll).aggregate(pipeline, options).toArray(function(err, doc) {
				if(err)
					reject(err);
				else
					resolve(doc);
			});
		});
	},

	tokenCheck: function(_token)
	{
	  	return new Promise(function (resolve, reject) {
		  	self.findOne('Token', { token: _token }).then(function(result) {
			  	if(!result) // Token 이 존재하지 않음
				  	resolve(102);
			  	else
				  	resolve(0);
		  	}).catch(function(error) {
			  	log.error('tokenCheck()', err);
			  	reject(error);
		  	});
	  	});
	},

	updateStatistics: function(_reservId, _status, _type, param)
	{
		return new Promise(function (resolve, reject) {
		  	var updateQuery = {
	  			$addToSet: {statusList: _status},
	  			$set: {currentStatus: _status}
		  	};

			// 예약 상태 추가
			self.findOne('Reserv', {_id: ObjectId(_reservId)}, {storeId: 1, userId: 1, phoneNumber: 1, name: 1, reservNumber: 1, reservTime: 1}).then(function(result) {
				var reservUpdatePromise = self.updateOne('Reserv', {_id: ObjectId(_reservId)}, updateQuery, { upsert: false });
				var storeFindPromise = self.findOne('Store', {_id: ObjectId(result.storeId)}, {_id: 0, fcmKeyList: 1, phoneNumber: 1, storeName: 1});

				return Promise.all([reservUpdatePromise, storeFindPromise, result]);
		  	}).then(function(result) {
				var fcmKeyList = result[1].fcmKeyList;
				var userId = result[2].userId;
				var storeId = result[2].storeId;

				var userUpdateQuery = {};

			  	if(_status =='reserved')
				  	userUpdateQuery = { totalReservedCnt: 1 };
				else if(_status == 'reservwait')
					userUpdateQuery = { totalReservCnt: 1 };
			  	else if(_status =='storecancel')
				{
					if(_type == 'Store' && param)
					{
						// 알림톡 서버로 예약 정보 넘겨주면 사용자에게 핸드폰번호로 문자 전송
						var parm = {
							storePhoneNumber: result[1].phoneNumber,
							storeName: result[1].storeName,
							phoneNumber: result[2].phoneNumber,
							reservName: result[2].name,
							reservNumber: result[2].reservNumber,
							reservDate: result[2].reservTime,
							reason: param.reason
						};

						util.requestPost('http://test.io:5000/store/cancel', parm);
					}

			      	userUpdateQuery = { totalStoreCancelCnt: 1 };
				}
			  	else if(_status =='usercancel')
					userUpdateQuery = { totalUserCancelCnt: 1 };
			  	else if(_status =='noshow')
				  	userUpdateQuery = { totalNoshowCnt: 1 };
			  	else if(_status =='visit')
				  	userUpdateQuery = { totalVisitCnt: 1 };
			  	else
			  	  	reject(104);

				var _msgData = {
					reservId: _reservId,
					changeStatus: _status,
					msg: ''
				};
				var insertQuery = {
					storeId: ObjectId(storeId), // 전송해야할 매장
					type: _type, // 메시지 타입
					msgData: _msgData, // 메시지 데이터 - 타입에 따른 분류
					date: new Date() // 예약 발생 시간
				};

				Notification.pcPushData(storeId, insertQuery);
				// Notification.mobileFcmPush(_type, fcmKeyList, _reservId, _status);

				// 알림 로그
				var notiPromise = self.insertOne('Notification', insertQuery);
				// 고객의 총 예약 기록
				var userUpdatePromise = self.update('User', {_id: ObjectId(userId)}, { $inc: userUpdateQuery }, { upsert: false });
				// 고객의 특정 매장 예약 기록
				var statisticsInsertPromise = self.updateOne('Statistics', {userId: ObjectId(userId)}, {$set: {userId: ObjectId(userId), storeId: ObjectId(storeId)}, $inc: userUpdateQuery}, {upsert: true});

			  	return Promise.all([userUpdatePromise, notiPromise, statisticsInsertPromise]);
			}).then(function(result) {
		  		resolve(true);
		 	}).catch(function(error) {
				reject(error);
			});
		});
  	}

};
