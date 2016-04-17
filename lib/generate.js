/*

PURPOSE OF THIS FILE:

To generate all possible combinations of classes

*/

var TROJAN = require('./TROJAN');
var FUNC = require('./func');

/*
backtracing algorithm for USC course scheduling:

generate(collection):
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
	}

*/

var generate = function(courseidArray, masterCallback, end){

	courseidArray = courseidArray || [];

	var courseHeap = {}, combinationHeap = {};

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
			var queueLength = queue.length; // make a copy
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
		for(var courseidKey in courseidArray){
			TROJAN.course({course:courseidArray[courseidKey]}, function(courseData){
				var courseid = courseData.prefix + '-' + courseData.number;
				courseHeap[courseid] = courseData;
				findCombinations(courseid, courseData.SectionData);
			});
		}
	}

	var generateHelper = function(classIndex, callback, collection){
		var collection = collection || {};

		if(classIndex >= courseidArray.length){ // reached end
			callback(collection);
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

	}

	retrieveCourses(); // retrieve courses and fill combination heaps

	var timeout = setInterval(function(){
		if(Object.keys(combinationHeap).length >= courseidArray.length){
			//console.log(combinationHeap);
			var count = 0;
			generateHelper(0, function(data){
				count++;
				masterCallback(data);
			});
			console.log("Number of schedules generated: " + count);
			end(count);
			clearInterval(timeout);
		}
	}, 100);

}

module.exports = generate;