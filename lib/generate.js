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

var courseidArray = ["CSCI-104","CSCI-170"];

var courseHeap = {}, combinationHeap = {};

var retrieveCourses = function(){
	for(var courseid in courseidArray){
		TROJAN.course({course:courseid}, function(courseData){
			courseHeap[courseid] = courseData;
			findCombinations(courseid, courseData.SectionData);
		});
	}

	var findCombinations = function(courseid, sections){
		// first isolate sections
		var typeObj = {};
		for(var key in sections){
			typeObj[sections.key.type] = typeObj[sections.key.type] || [];
			typeObj[sections.key.type].push(key);
		}

		var goalSize = typeObj.length;
		var queue = [];
		var index = 0;

		while(index < goalSize){
			var tempQueue = [];
			var queueLength = (queue.length > 0) ? queue.length || 1; // set queue length
			for(var i = 0; i < queueLength; i++){
				for(var j = 0; j < typeObj[Object.keys(typeObj)[index]].length; j++){
					var tempArr = queue[i] || [];
					tempArr.push(typeObj[Object.keys(typeObj)[0]][j]);
					tempQueue.push(tempArr);
				}
			}
			queue.length = 0; // clear current queue
			queue = tempQueue; // replace queue with updated one
			index++;
		}
		combinationHeap[couseid] = queue; // store combinations
	}
}

var generate = function(classIndex, callback, collection){
	var tempCollection = collection || {};
	if(classIndex >= courseidArray.length){ // reached end
		callback(tempCollection);
		return;
	}

	var add = function(combination){
		tempCollection[courseidArray[classIndex]] = combination;
	}

	var remove = function(){
		delete tempCollection[courseidArray[classIndex]];
	}

	// for each course combination in class
	for(var i = 0; i < combinationHeap[courseidArray[classIndex]].length; i++){
		if(!add(combinationHeap[courseidArray[classIndex]][i])) continue;
		generate(classIndex+1, callback, tempCollection);
		remove();
	}

}