var fs = require('fs');

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Bold = "\x1b[3m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Cd = "\x1b[6m"
Hidden = "\x1b[8m"


FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"

var date = new Date();
var fileName = 'Util/Log/File/' + zeroFormating(date.getFullYear()) + "-" + zeroFormating(date.getMonth() + 1) + "-" + zeroFormating(date.getDate()) + ".log";
var logStream = fs.createWriteStream(fileName, {'flags': 'a'});

function zeroFormating(num, len = 2)
{
	if(len == 2)
		return num < 10 ? '0' + num : num;
	else if(len == 3)
		return num < 10 ? '00' + num : (num < 100 ? '0' + num : num);
	else
		return num;
}

function formDate(date)
{
	var monthStr = zeroFormating(date.getMonth() + 1);
	var dayStr = zeroFormating(date.getDate());
	var hourStr = zeroFormating(date.getHours());
	var minuteStr = zeroFormating(date.getMinutes());
	var secondStr = zeroFormating(date.getSeconds());
	var miliSecondStr = zeroFormating(date.getMilliseconds(), 3);
	return date.getFullYear() + '-' + monthStr +  '-' + dayStr  + ' ' + hourStr + ':' + minuteStr + ':' + secondStr + '.' + miliSecondStr;
}

function saveLog(msg)
{
	msg = msg + '\n';
	logStream.write(msg);
}

module.exports = {

	reqLogger : function(res)
	{
		var ip = res.req.headers['x-real-ip'] || res.req.connection.remoteAddress;
		var dateStr = formDate(new Date());
		var result =  ip + ' ' + res.req.method + ' ' + res.req.headers.host + res.req.url + ' ' + /* JSON.stringify(res.req.body) +  ' ' + */ res.req.headers['user-agent'];

		console.log(Bright + dateStr  + ' INFO ' + Reset + result + Reset);
		saveLog(dateStr + ' INFO ' + result);
	},

    info : function(msg)
    {
		var dateStr = formDate(new Date());
        console.log(Bright + dateStr + ' INFO ' + Reset + msg + Reset);
		saveLog(dateStr + ' INFO ' + msg);
    },

    debug : function(msg)
    {
		var dateStr = formDate(new Date());
		console.log(Bright + dateStr + FgMagenta + ' DEBUG ' + Reset + msg + Reset);
		saveLog(dateStr + ' DEBUG ' + msg);
    },

    connect : function(msg)
    {
		var dateStr = formDate(new Date());
		console.log(Bright + dateStr + FgBlue + ' CONNECT ' + Reset + msg + Reset);
		saveLog(dateStr + ' CONNECT ' + msg);
    },

    notice : function(msg)
    {
		var dateStr = formDate(new Date());
		console.log(Bright + dateStr + FgCyan + ' NOTICE ' + Reset + msg + Reset);
		saveLog(dateStr + ' NOTICE ' + msg);
    },

    error : function(msg, err, parm)
    {
		var dateStr = formDate(new Date());
		console.error(Bright + dateStr + FgRed+ ' ERROR ' + Reset + msg + Reset, err, parm);
		saveLog(dateStr + ' ERROR ' + msg + ' ' + err + ' ' + JSON.stringify(parm));
    },

    warning : function(msg)
    {
		var dateStr = formDate(new Date());
		console.log(Bright + dateStr + FgYellow + ' WARNING ' + Reset + msg + Reset);
		saveLog(dateStr + ' WARNING ' + msg);
    },
};
