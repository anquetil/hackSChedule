var _ = require('lodash');
var database = require('./database');
var sectionsRef = database.sectionsRef;

// var numUsers = 0;

module.exports = function (socket) {
  // var saved = false;

  sectionsRef.on('child_changed', function (snap, prevKey) {
    socket.emit('receive:courseData', prevKey);
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
