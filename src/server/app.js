// app.js

// SETUP
var express     = require('express');
var app         = express(); // create express app
var http        = require('http');
// var io          = require('socket.io')(server);

var bodyParser  = require('body-parser');
var path        = require('path');

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());

// allow promises
// app.use(require('express-promise')());

// setup api router
var api = require('./api/routes');
app.use('/api', api);

// setup socket
// var socket = require('./lib/socket');
// io.on('connection', socket);

// serve static
app.use('/res', express.static(path.join(__dirname, '../..', 'www', 'res')));
app.get('*', (_, res) => { res.sendFile(path.join(__dirname, '../..', 'www', 'index.html')); });


// start the server
var port = process.env.PORT || 3000;
http.createServer(app).listen(port);

// logs errors
process.on('uncaughtException', function (err) {
  console.error("Uncaught Exception:", err);
  process.exit(1);  // This is VITAL. Don't swallow the err and try to continue.
});
