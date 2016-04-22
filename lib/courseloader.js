var deepcopy = require("deepcopy");
var TROJAN = require('./TROJAN');
var Generate = require('./generate');
var FUNC = require('./func');

module.exports = function(socket){

  console.log("a user has connected");

  var courseIdArr = [];
  var courseHeap = {};
  var collection = [];
  var seed = 0;

  socket.on('add class', function(courseId){
    // download class
    TROJAN.course({course: courseId},function(data){
      if(!(typeof data.error === 'undefined')) return; // course doesn't exist
      // add to courseIdArr, courseHeap
      var newCourseId = data.prefix + '-' + data.number + data.sequence;
      if(courseIdArr.indexOf(newCourseId) > -1) return; // course already saved
      courseIdArr.push(newCourseId);
      courseHeap[newCourseId] = data;
      // push courses to UI
      socket.emit('update courses', {add: true, courseIdArr: courseIdArr, courseHeap: courseHeap});
      generateSchedules(false, courseId);
    });
  });

  socket.on('remove class', function(courseId){
      // delete from courseIdArr, courseHeap
      courseIdArr.splice(courseIdArr.indexOf(courseId), 1);
      delete courseHeap[courseId];
      // push courses to UI
      socket.emit('update courses', {add: false, courseIdArr: courseIdArr, courseHeap: courseHeap});
      generateSchedules(true, courseId);
  });

  function generateSchedules(pure, newCourse){
    var saveSeed = Date.now();
    seed = saveSeed;
    var newCollection = [];
    if(pure){
      Generate.courseHeap(courseIdArr, courseHeap, function(data){
        var object = deepcopy(data);
        if(seed == saveSeed){ // bad solution
          socket.emit('add schedule', data);
          newCollection.push(data);
        } else return;
      }, function(){
        if(seed == saveSeed){
          socket.emit('end generation');
          collection = newCollection;
        }
      });
    } else {
      Generate.courseHeapWithPrev(newCourse, courseIdArr, courseHeap, collection, function(data){
        var object = deepcopy(data);
        if(seed == saveSeed){ // bad solution
          socket.emit('add schedule', data);
          newCollection.push(data);
        } else return;
      }, function(){
        if(seed == saveSeed){
          socket.emit('end generation');
          collection = newCollection;
        }
      })
    }
  }

}