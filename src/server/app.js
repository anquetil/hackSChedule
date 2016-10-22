// app.js

// SETUP
var express     = require('express');
var app         = express(); // create express app
var server      = require('http').Server(app);
var io          = require('socket.io')(server);

var bodyParser  = require('body-parser');
var path        = require('path');

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());

// allow promises
app.use(require('express-promise')());

// set port
app.set('port', (process.env.PORT || 5000));

// setup api router
var api = require('./api');
app.use('/api', api);

// setup socket
var socket = require('./lib/socket');
io.on('connection', socket);

// serve static
app.use('/', express.static(path.join(__dirname, '../..', 'www')));
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));
app.get('*', (_, res) => { res.sendFile(path.join(__dirname, '../..', 'www', 'index.html')); });

// start the server
server.listen(app.get('port'), function () {
  console.log('RUNNING.');
});
