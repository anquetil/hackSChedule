/* generate.js: The purpose is to generate all possible combinations of classes */
var TROJAN = require('./TROJAN');
var FUNC = require('./func');

/* generate(collection):
  look for next class
  if(reached end of classes){
    add collection to heap
    return;
  }
  else {
    for(each course combination in class)
    {
      attempt to add(combination, collection);
      if(fail) continue

      generate(collection)

      remove(combination, collection)

    }
  }*/

var generateCourseheap = function(courseHeap, courseidArray, callback, end){
  courseidArray = courseidArray || [];
  courseHeap = courseHeap || {};

  var combinationHeap = {};

  var findCombinations = function(courseid, sections){
    // first isolate sections
    var typeObj = {};
    for(var key in sections){
      typeObj[sections[key].type] = typeObj[sections[key].type] || [];
      typeObj[sections[key].type].push(key);
    }

    var goalSize = Object.keys(typeObj).length;
    var queue = [];
    queue.push([]); // add an empty start
    var left = 0;

    for(var index = 0; index < goalSize; index++){ // for each section type
      var queueLength = queue.length; // make a copy of queueLength
      for(var i = left; i < queueLength; i++){ // for each item in the queue
        left++;
        var typeKey = Object.keys(typeObj)[index]; // make a copy of key
        for(var j = 0; j < typeObj[typeKey].length; j++){ 
          // for each item in the section type

          var tempArr = queue[i].slice() || [];

          // weed out conflicts
          var compatible = true;
          var currSectionid = typeObj[typeKey][j];
          var currCourseData = courseHeap[courseid].SectionData;
          var t1 = currCourseData[currSectionid];
          for(var sectionKey in tempArr){
            var sectionid = tempArr[sectionKey];
            var t2 = currCourseData[sectionid];
            if(FUNC.checkConflict(t1, t2)) compatible = false;
          }
          
          if(compatible){
            tempArr.push(currSectionid);
            queue.push(tempArr);
          }
        }
      }
    }
    queue.splice(0, left); // delete unnecessary shit

    combinationHeap[courseid] = queue; // store combinations
  }

  var retrieveCourses = function(){
    for(var courseidKey in courseHeap){
      findCombinations(courseidKey, courseHeap[courseidKey].SectionData);
    }
  }

  var generateHelper = function(classIndex, callback, collection){
    var collection = collection || {};

    if(classIndex >= courseidArray.length){ // reached end
      callback(cleanup(collection), 0);
      return;
    }

    var courseid = courseidArray[classIndex]

    // for each course combination in class
    for(var i = 0; i < combinationHeap[courseid].length; i++){
      if(!add(combinationHeap[courseid][i])) continue;
      generateHelper(classIndex+1, callback, collection);
      remove();
    }

    function add(combination){
      var currSectionData = courseHeap[courseid].SectionData;
      // weed out time
      for(var courseKey in collection){
        var compSectionData = courseHeap[courseKey].SectionData;
        for(var i = 0; i < collection[courseKey].length; i++){
          var t1 = compSectionData[collection[courseKey][i]];
          for(var j = 0; j < combination.length; j++){
            var t2 = currSectionData[combination[j]];
            if(FUNC.checkConflict(t1, t2)) return false;
          }
        }
      }
      // first check if each element has no conflict. then...
      collection[courseid] = combination;
      return true;
    }

    function remove(){
      delete collection[courseid];
    }

    function cleanup(object){
      var object2 = {};
      for(var course in object){
        object2[course] = {};
        for(var sectionpos in object[course]){
          var section = object[course][sectionpos];
          object2[course][section] = {
            day: courseHeap[course].SectionData[section].day,
            start: FUNC.convertToMin(courseHeap[course].SectionData[section].start_time),
            end: FUNC.convertToMin(courseHeap[course].SectionData[section].end_time)
          }
        }
      }
      return object2;
    }

  }

  retrieveCourses(); // retrieve courses and fill combination heaps

  var timeout = setInterval(function(){
    if(Object.keys(combinationHeap).length >= courseidArray.length){
      //console.log(combinationHeap);
      var count = 0;
      generateHelper(0, function(data, score){
        count++;
        callback(data, score);
      });
      console.log("Number of schedules generated: " + count);
      end(count);
      clearInterval(timeout);
    }
  }, 100);

}

var generate = function(courseidArray, callback, end){
  courseidArray = courseidArray || [];

  var courseHeap = {};

  var retrieveCourses = function(){
    for(var courseidKey in courseidArray){
      TROJAN.course({course:courseidArray[courseidKey]}, function(courseData){
        var courseid = courseData.prefix + '-' + courseData.number;
        courseHeap[courseid] = courseData;
      });
    }
  }

  var timeout = setInterval(function(){
    if(Object.keys(courseHeap).length >= courseidArray.length){
      generateCourseheap(courseHeap, courseidArray, callback, end);
      clearInterval(timeout);
    }
  }, 100);

  retrieveCourses();

}

module.exports = generate;
module.exports.courseheap = generateCourseheap;