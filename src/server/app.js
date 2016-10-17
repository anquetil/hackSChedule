// app.js

// SETUP
var express     = require('express');
var app         = express(); // create express app
var bodyParser  = require('body-parser');
var http        = require('http').Server(app);
var path        = require('path');

// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow promises
app.use(require('express-promise')());

// serve static
app.use('/', express.static(path.join(__dirname, '../..', 'www')));

// set port
app.set('port', (process.env.PORT || 5000));

// setup api router
var api = require('./api');
app.use('/api', api);

// start the server
http.listen(app.get('port'), function () {
  console.log('RUNNING.');
});
