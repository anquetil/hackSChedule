var term = '20173';
var suffix = '@usc.edu';

var database = {};

db = require('../lib/firebase');
database.schedulesRef = db.ref('/' + term + '_schedules');
database.coursesRef = db.ref('/' + term + '_courses');
database.sectionsRef = db.ref('/' + term + '_sections');
database.usersRef = db.ref('/' + term + '_users');


database.isEmailValid = function (email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email) && email.indexOf(suffix) > 1;
}

database.isPinValid = function (pin) {
	var re = /(\d{4})/;
	return re.test(pin);
}

database.getUserName = function (email) {
	return email.split('@')[0].replace('.', '-');
}

database.term = term;

module.exports = database;
