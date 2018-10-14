// main Require
var express = require('express');
var app = express();
var http = require('http').Server(app);

var crypto = require('crypto');
// User Require
var database = require('./DB/connection.js');
var log = require('./Util/Log');

var bodyParser = require('body-parser');
var cors = require('cors');
var engine = require('consolidate');

// Socket.io
var io = require('socket.io')(http);
var socketIo = require('./Notification/socket.js');
var jConfig = require('./serverConfig.json');

// CORS 설정 cross 문제 해결 ajax
app.use(cors());

app.set('views', __dirname + '/Views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// http Request Log
app.use(function(req, res, next) {
	log.reqLogger(res);
	next();
});

log.info('Server Virsion : ' + jConfig.version);

// DB 연결
database.init();
// Socket IO Start
socketIo.start(io);

http.listen(jConfig.port, function(){
  log.info('listening on http://' + jConfig.host + ':' + jConfig.port);
});

app.use('/store', require('./Router/Store/index'));
app.use('/user', require('./Router/User/index'));
app.use('/server', require('./Router/Server/index'));
// css, js, img 정적파일
app.use('/static', express.static('public'));
