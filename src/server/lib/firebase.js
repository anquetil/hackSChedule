var firebase = require('firebase');
var app = firebase.initializeApp({
  serviceAccount: "src/server/lib/hackSChedule-6b05a1e6f9fd.json",
  databaseURL: "https://hackschedule-6933c.firebaseio.com"
});
var db = firebase.database();
module.exports = db;
