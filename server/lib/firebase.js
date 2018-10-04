var admin = require("firebase-admin");
var serviceAccount = require("./hackschedule-2-firebase-adminsdk-fklnw-57e52be0fe.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackschedule-2.firebaseio.com"
});

var db = admin.database();
module.exports = db;
