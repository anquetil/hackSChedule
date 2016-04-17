// goal: define what is shown on /api/:method?params=query

var Firebase = require('firebase');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");
var TROJAN = require('./TROJAN');

module.exports = function(req,res){

	var method = req.params.method; // api/:method
	var action = req.params.action; // api/:method.:action
	var queries = req.query; // {param1:query1, param2:query2}

	if(method == "user"){
		if(action == "addCourse"){
			TROJAN.current_term({},function(term){
				var dbTerm = db.child(term);
				var userid = queries.user;
				var courseid = TROJAN.courseIDSplit(queries.course)[3];
				if(userid && courseid){
					dbTerm.child("courses").child(courseid).once("value",function(snapshot){
						console.log(snapshot.val());
						if(snapshot.exists()){
							TROJAN.course({term:term, course:courseid},function(courseData){
								dbTerm.child("courses").child(courseid).update(courseData); // update course per 
								dbTerm.child("users").child(userid).child("courses").child(courseid).update({courseid}); // save to student
							});
							TROJAN.course({course: courseid}, res.json);
						}
						else res.json({error: "course doesn't exist."});
					});
				}
				else res.json({error: "Query requires user and course"});
			});
		}
		else if(action == "removeCourse"){
			TROJAN.current_term({},function(term){
				var dbTerm = db.child(term);
				var userid = queries.user;
				var courseid = TROJAN.courseIDSplit(queries.course)[3];
				if(userid && courseid){
					dbTerm.child("users").child(userid).child("courses").child(courseid).remove();
					res.json({success: true});
				}
				else res.json({error: "Query requires user and course"})
			});
		}
	}
	else if(method == "admin"){
		if(action == "updateCourses"){
			// UPDATE DATABASE WITH FRESH DATA
			TROJAN.current_term({},function(term){
				var dbTerm = db.child(term);
				TROJAN.dept({term:term},function(departments){
					Object.keys(departments).forEach(function(deptkey){
						var object = {};
						object[deptkey] = departments[deptkey];
						dbTerm.child("depts").update(object);
						TROJAN.course_list({term:term,dept:deptkey},function(course_list){
							if(Object.keys(course_list).length > 0)
								dbTerm.child("courses").update(course_list);
							else console.log("Could not find course_list for " + deptkey);
						});
					});
				}, function(){
					res.json({success: true});
				});
			});
		}
	}
	else if(method == "method"){
		if(action == "term") TROJAN.term(queries, res.json);
		else if(action == "current_term") TROJAN.current_term(queries, res.json);
		else if(action == "dept") TROJAN.dept(queries, res.json);
		else if(action == "course_list") TROJAN.course_list(queries, res.json);
		else if(action == "course") TROJAN.course(queries, res.json);
	}
	else res.json({error: "nomethod"});
}