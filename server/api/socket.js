var _ = require('lodash');
var database = require('./database');
var sectionsRef = database.sectionsRef;
var usersRef = database.usersRef;

// var numUsers = 0;

module.exports = function (socket) {
  // var saved = false;

  sectionsRef.on('child_changed', function (snap, key) {
    socket.emit('receive:courseData', key);
  });

	usersRef.on('child_changed', function (snap, key) {
		var val = snap.val();
		var email = val.email;
		var paid = val.paid;
		if (paid) socket.emit('receive:userChangedPaid', { email, paid });
	});

  // socket.on('connect', function() {
  //   if (saved) return;
	//
  //   saved = true;
  //   numUsers++;
  // });
	//
  // socket.on('disconnect', function () {
  //   if (saved) {
  //     saved = false;
  //     numUsers--;
  //   }
  // });

};
