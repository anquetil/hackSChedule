var express = require('express');
var app = express();
var path = require('path');
var Firebase = require('firebase');
var async = require('async');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");

//var TROJAN = require('./lib/TROJAN');
var api = require('./lib/api');

app.set('port', (process.env.PORT || 5000));

app.use(require('express-promise')());
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/:method.:action', api);
app.get('/api/:method', api);

app.listen(app.get('port'), function () {
  console.log('RUNNING.');
});