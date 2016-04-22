/* generate.js: generate all possible combinations of classes */
/* returns: an array of each course combination, with day,start,end data */

var TROJAN = require('./TROJAN');
var Algorithm = require('./algorithms');

var generateCourseHeapWithPrevious = function(newCourse, courseIdArray, courseHeap, collection, callback, end){
  courseHeap = courseHeap || {};
  courseIdArray = courseIdArray || Object.keys(courseHeap) || [];
  newCourse = TROJAN.courseIDSplit(newCourse)[3];
  //console.log(newCourse);

  var fixedCollection = [];
  // convert collection
  for(var item in collection){
    for(var course in collection[item].data){
      collection[item].data[course] = Object.keys(collection[item].data[course]);
    }
    fixedCollection.push(collection[item].data);
  }

  if(fixedCollection.length == 0)
    collection = [{}];
  else collection = fixedCollection;
  //console.log(collection);

  var combinationHeap = {};
  Algorithm.findCombinations(courseHeap, newCourse, courseHeap[newCourse].SectionData, function(data){
    combinationHeap[newCourse] = data;
  });

  var timeout = setInterval(function(){
    if(Object.keys(combinationHeap).length == 1){
      var count = 0;
      for(var i in collection){
        Algorithm.generate(courseIdArray, courseHeap, combinationHeap, courseIdArray.indexOf(newCourse), function(data, score){
          count++;
          callback({score: score, data: data});
        }, collection[i]);
      }
      console.log("Number of schedules generated: " + count);
      end(count);
      clearInterval(timeout);
    }
  }, 100);
}

var generateCourseHeap = function(courseIdArray, courseHeap, callback, end){
  courseHeap = courseHeap || {};
  courseIdArray = courseIdArray || Object.keys(courseHeap) || [];

  var combinationHeap = {};

  // RETRIEVE COURSE COMBINATIONS, FIND ALL COMBINATIONS
  for(var courseId in courseHeap){
    Algorithm.findCombinations(courseHeap, courseId, courseHeap[courseId].SectionData, function(data){
      combinationHeap[courseId] = data;
    });
  }

  // GENERATION ALGORITHM, CALLBACK
  var timeout = setInterval(function(){
    if(Object.keys(combinationHeap).length >= courseIdArray.length){
      var count = 0;
      Algorithm.generate(courseIdArray, courseHeap, combinationHeap, 0, function(data, score){
        count++;
        callback({score: score, data: data});
      });
      console.log("Number of schedules generated: " + count);
      end(count);
      clearInterval(timeout);
    }
  }, 100);

}

var generate = function(courseIdArray, callback, end){
  courseIdArray = courseIdArray || [];

  var courseHeap = {};

  for(var courseIdKey in courseIdArray){
    TROJAN.course({course:courseIdArray[courseIdKey]}, function(courseData){
      var courseId = courseData.prefix + '-' + courseData.number + courseData.sequence;
      courseIdArray[courseIdKey] = courseId;
      courseHeap[courseId] = courseData;
    });
  }

  var timeout = setInterval(function(){
    if(Object.keys(courseHeap).length >= courseIdArray.length){
      generateCourseHeap(courseIdArray, courseHeap, callback, end);
      clearInterval(timeout);
    }
  }, 100);

}

module.exports = generate;
module.exports.courseHeap = generateCourseHeap;
module.exports.courseHeapWithPrev = generateCourseHeapWithPrevious;