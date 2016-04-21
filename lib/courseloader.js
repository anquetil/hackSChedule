var deepcopy = require("deepcopy");
var TROJAN = require('./TROJAN');
var Generate = require('./generate');
var FUNC = require('./func');

module.exports = function(socket){

  console.log("a user has connected");

  var courseIdArr = [];
  var courseHeap = {};
  var seed = 0;

  socket.on('add class', function(courseId){
    // download class
    console.log(courseId);
    TROJAN.course({course: courseId},function(data){
      console.log(data);
      if(!(typeof data.error === 'undefined')) return; // course doesn't exist
      // add to courseIdArr, courseHeap
      var newCourseId = data.prefix + '-' + data.number + data.sequence;
      courseIdArr.push(newCourseId);
      courseHeap[newCourseId] = data;
      // push courses to UI
      socket.emit('update courses', {add: true, courseIdArr: courseIdArr, courseHeap: courseHeap});
      generateSchedules();
    });
  });

  socket.on('remove class', function(courseId){
      // delete from courseIdArr, courseHeap
      courseIdArr.splice(courseIdArr.indexOf(courseId));
      delete courseHeap[courseId];
      // push courses to UI
      socket.emit('update courses', {add: false, courseIdArr: courseIdArr, courseHeap: courseHeap});
      generateSchedules();
  });

  function generateSchedules(){
    var saveSeed = Date.now();
    seed = saveSeed;
    Generate.courseHeap(courseIdArr, courseHeap, function(data){
      var object = deepcopy(data);
      if(seed == saveSeed){ // bad solution
        socket.emit('add schedule', data);
      } else return;
    }, function(){
      if(seed == saveSeed) socket.emit('end generation');
    });
  }

}