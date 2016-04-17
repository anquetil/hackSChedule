
var Firebase = require('firebase');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");


db.child("20163").child("courses").once("value",function(snapshot){
	var allCourses = snapshot.val();

	var object = {};

	for(var courseid in allCourses){
		var sectionData = allCourses[courseid].SectionData;
		for(var sectionid in sectionData){
			object[sectionData[sectionid].type] = sectionData[sectionid].type;
		}
	}

	console.log(object);
});