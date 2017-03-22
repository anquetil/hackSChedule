// app.js

// SETUP
var express     = require('express');
var http        = require('http');
var app         = express(); // create express app
// var io          = require('socket.io')(server);

var bodyParser  = require('body-parser');
var path        = require('path');


app.set('port', process.env.PORT || 5000);

app.use('*', function (req, res, next) {
	if (req.headers['X-Forwarded-Proto'] === "https"){
   return next();
  }
	res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
});

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
app.use('/', express.static(path.join(__dirname, '../..', 'www')));
app.use('/res', express.static(path.join(__dirname, '../..', 'www', 'res')));
app.get('*', (_, res) => { res.sendFile(path.join(__dirname, '../..', 'www', 'index.html')); });


// start the server
console.log(app.get('port'));
var server = app.listen(app.get('port'), function() {
  // debug('Express server listening on port ' + server.address().port);
});

// logs errors
process.on('uncaughtException', function (err) {
  console.error("Uncaught Exception:", err);
  process.exit(1);  // This is VITAL. Don't swallow the err and try to continue.
});
