var FUNC = require('./func');

var findCombinations = function(courseHeap, courseId, sections, callback){
  if(Object.keys(sections).length < 1) return;
  // Scan to see if {Lec -> Disc, Lec -> Disc} or {Lec, Lec, Disc, Disc}. Order matters!
  var orderType = scanSectionOrder(sections);
  // 0: class doesn't have lectures, so order doesn't matter
  // 1: {Lec -> Disc, Lec -> Disc, Quiz} most likely
  // 2: {Lec, Lec, Disc, Disc, Quiz} for sure
  function scanSectionOrder(sections){
    var result = 0;

    if(sections[Object.keys(sections)[0]].type == 'Lec') result = 1;
    if(sections[Object.keys(sections)[0]].type == 'Lec') result = 2;

    var count = 0;
    for(var key in sections)
      if(sections[key].type == 'Lec')
        count++;

    if(count == 1) result = 2;

    return result;
  }

  // place each combination sections into the bucket
  var buckets = [];
  var temp = {};
  for(var key in sections){
    if(orderType == 1 && Object.keys(temp).length > 0){
      buckets.push(temp);
      temp = {};
    }
    temp[sections[key].type] = temp[sections[key].type] || [];
    temp[sections[key].type].push(key);
  }
  buckets.push(temp);

  // Find combinations using a queue and BFS
  var masterHeap = [];

  // repeat for each bucket
  for(var bucket in buckets){
    var goalSize = Object.keys(buckets[bucket]).length;
    var queue = [[]];
    var left = 0, index = 0;
    // ensure each queue would end with the same size
    while(index < goalSize){
      var queueLength = queue.length; // make copy of queueLength
      // for each item in the queue
      for(var i = left; i < queueLength; i++){
        var typeKey = Object.keys(buckets[bucket])[index];
        // for each section in the current sectiontype in the current bucket
        for(var j = 0; j < buckets[bucket][typeKey].length; j++){

          var temp = queue[i].slice() || []; // deep copy

          var compatible = true;
          var currSectionId = buckets[bucket][typeKey][j];
          var currCourseData = courseHeap[courseId].SectionData;
          var t1 = currCourseData[currSectionId];
          for(var sectionKey in temp){
            var sectionid = temp[sectionKey];
            var t2 = currCourseData[sectionid];
            if(FUNC.checkConflict(t1, t2)) compatible = false;
          }

          if(compatible){
            temp.push(currSectionId);
            queue.push(temp);
          }

        }
        left++;
      }
      index++;
    }
    queue.splice(0, left); // delete part of the queue
    masterHeap = masterHeap.concat(queue);
  }

  callback(masterHeap);
}

var generateHelper = function(courseIdArray, courseHeap, combinationHeap, courseIndex, callback, collection){
  var collection = collection || {};

  if(courseIndex >= courseIdArray.length){
    callback(cleanup(collection), 0);
    return;
  }

  var courseId = courseIdArray[courseIndex];

  // for each course combination in class
  for(var i = 0; i < combinationHeap[courseId].length; i++){
    if(!add(combinationHeap[courseId][i])) continue;
    generateHelper(courseIdArray, courseHeap, combinationHeap, courseIndex+1, callback, collection);
    remove();
  }

  function add(combination){
    var currSectionData = courseHeap[courseId].SectionData;
    // weed out conflict
    for(var courseKey in collection){
      var compareSectionData = courseHeap[courseKey].SectionData;
      for(var i in collection[courseKey]){
        var t1 = compareSectionData[collection[courseKey][i]];
        for(var j in combination){
          var t2 = currSectionData[combination[j]];
          if(FUNC.checkConflict(t1,t2)) return false;
        }
      }
    }
    // no conflict? add to collection!
    collection[courseId] = combination;
    return true;
  }

  function remove(){
    delete collection[courseId];
  }

  function cleanup(object){
    var newObject = {};
    for(var course in object){
      newObject[course] = {};
      for(var sectionPos in object[course]){
        newObject[course][object[course][sectionPos]] = []
        var section = object[course][sectionPos];
        var day = courseHeap[course].SectionData[section].day;
        var start = courseHeap[course].SectionData[section].start_time;
        var end = courseHeap[course].SectionData[section].end_time;

        if(!(typeof day === 'Object')){
          day = [day];
          start = [start];
          end = [end];
        }

        for(var key in day){
          if(start[key] == 'TBA') day[key] = 'A';
          else {
            start[key] = FUNC.convertToMin(start[key]);
            end[key] = FUNC.convertToMin(end[key]);
          }
          newObject[course][object[course][sectionPos]].push({
            day: day[key],
            start: start[key],
            end: end[key]
          });
        }

      }
    }
    return newObject;
  }

}


module.exports.findCombinations = findCombinations;
module.exports.generate = generateHelper;