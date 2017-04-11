var admin = require('firebase-admin');
var serviceAccount = require('./hackSChedule-6345acda7621.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackschedule-6933c.firebaseio.com"
});

var db = admin.database();
module.exports = db;
