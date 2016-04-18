
var Firebase = require('firebase');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");


db.child("20163").child("courses").once("value",function(snapshot){
	var allCourses = snapshot.val();

	var object = {};

	for(var courseid in allCourses){
		var sectionData = allCourses[courseid].SectionData;
		var array = [];
		for(var sectionid in sectionData){
			array.push(sectionData[sectionid].type);
		}
		if(array.length > 1) object[courseid] = array;
	}

	console.log(object);
});