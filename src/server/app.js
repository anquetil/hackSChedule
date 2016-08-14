var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var api = require('./api');

app.set('port', (process.env.PORT || 5000));

app.use(require('express-promise')());
app.use('/', express.static(path.join(__dirname, '../..', 'www')));

app.get('/api/:method.:action', api);

http.listen(app.get('port'), function () {
  console.log('RUNNING.');
});
