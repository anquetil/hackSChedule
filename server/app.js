// app.js

// SETUP
var express 		= require('express');
var app         = express();
var http        = require('http');
var server 			= http.Server(app);
var io          = require('socket.io')(server);

app.set('port', process.env.PORT || 5000);
server.listen(app.get('port'));

var bodyParser  = require('body-parser');
var path        = require('path');

// setup socket
var socket = require('./api/socket');
io.on('connection', socket);

app.use(function(req, res, next) {
	res.io = io;
	next();
})

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());

// setup api router
var api = require('./api/routes');
app.use('/api', api);

// serve static
app.use('/', express.static(path.join(__dirname, '..', 'build')));
app.get('*', (_, res) => { res.sendFile(path.join(__dirname, '..', 'build', 'index.html')); });

// logs errors
process.on('uncaughtException', function (err) {
  console.error("Uncaught Exception:", err);
  process.exit(1);  // This is VITAL. Don't swallow the err and try to continue.
});
