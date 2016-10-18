var firebase = require('firebase');
var app = firebase.initializeApp({
  serviceAccount: "src/server/lib/hackSChedule-6345acda7621.json",
  databaseURL: "https://hackschedule-6933c.firebaseio.com"
});
var db = firebase.database();
module.exports = db;
