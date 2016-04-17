/*
backtracing algorithm for USC course scheduling:

1. find all the course combinations for each course, store that into database

var collection = {}

add(combination, collection):
	check if 

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

var courses = ["CSCI-104","CSCI-170"];

var collection = {}, courseHeap = {};

var findCombinations = function(courseid, ){

}

var add = function(combination){

}

var generate = function(callback){

}