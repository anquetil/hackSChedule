var _ = require('lodash');
var db = require('./firebase');

// var numUsers = 0;

module.exports = function (socket) {
  // var saved = false;

  var ref = db.ref('courses');

  ref.on('child_changed', function (snap, prevKey) {
    socket.emit('receive:courseData', prevKey);
  });

  socket.on('disconnect', function () {
    ref.off('child_changed');
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
