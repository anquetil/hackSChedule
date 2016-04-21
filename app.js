var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('port', (process.env.PORT || 5000));

app.use(require('express-promise')());
app.use('/', express.static(path.join(__dirname, 'public')));

//var TROJAN = require('./lib/TROJAN');
var api = require('./lib/api');
app.get('/api/:method.:action', api);
app.get('/api/:method', api);

var courseLoader = require('./lib/courseloader')
var nsp = io.of("/schedule");
nsp.on('connection', courseLoader);

http.listen(app.get('port'), function () {
  console.log('RUNNING.');
});