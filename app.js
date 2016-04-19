var express = require('express');
var app = express();
var path = require('path');
var Firebase = require('firebase');
var async = require('async');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");

//var TROJAN = require('./lib/TROJAN');
var api = require('./lib/api');
var port = process.env.PORT || 8080;

app.use(require('express-promise')());
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/api/:method.:action', api);
app.get('/api/:method', api);

app.listen(port, function () {
  console.log('Example app listening on port '+port+'!');
});