var req = require('request');
var crypto = require('crypto');

module.exports = {
    requestPost : function(_url, _parm)
    {
		return new Promise(function (resolve, reject) {
			req.post({url: _url, form: _parm}, function(error, response, body) {
				if(error)
					reject(105);
				else {
					resolve(true);
				}
			});
		});
	},

	saltHash: function(_str)
	{
		var saltArr = ['o#$!2c', 'sa1@#df', 'wq!%3', '*&v89', '2!@1s', 'co!D@a', 'wD!@23', 'b#^G*tn', '#32h9N&', 'v9F#@wi'];
		var saltStr = "";

		for(var i = 0 ; i< _str.length; i++)
			saltStr += saltArr[Number(_str.charCodeAt(i) % 10)];

		for(var i = 0; i < 10; i++)
			saltStr = crypto.createHash('sha256').update(saltStr + saltStr).digest('hex');

		return saltStr;
	},


	zeroFormating: function(num, len)
	{
		if(len == 2)
			return num < 10 ? '0' + num : num;
		else if(len == 4)
			return num < 10 ? '000' + num : (num < 100 ? '00' + num : (num < 1000 ? '0' : num));
	},

	stringToArray: function(_string) {
		if(!_string)
			return [];

		var resultArray = [];
		var splitArray = _string.split(',');

		// trim 때문에 반복
		for(var j =0; j < splitArray.length; j++)
			resultArray.push(splitArray[j].trim());

		return resultArray;
	}
};
