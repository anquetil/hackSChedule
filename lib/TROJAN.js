"use strict";

(function () {

var TROJAN = {};

const http = require('http');
const async = require('async');

var urlparse = function(url,callback){
	url = "http://web-app.usc.edu/web/soc/api" + url;
	http.get(url,function(res){
		var body = '';
		res.on('data', function(ch){ body += ch });
		res.on('end', function(){
			try {
				var data = JSON.parse(body);
				callback(data);
			} catch (e) { 
				console.error("Error: ", e) 
			}
		});
	}).on('error', function(e){
		console.error("Error: ", e);
	});
}

// array of terms
TROJAN.term = function(val, callback, end) {
	val = val || {};
	end = end || function(){};
	var url = "/terms";

	urlparse(url,function(data){
		callback(data.term);
		end();
	});
}

// current term #
TROJAN.current_term = function(val, callback, end) {
	val = val || {};
	end = end || function(){};

	TROJAN.term(val, function(data){
		callback(data[data.length - 1]);
	}, end());
}

// getting a list of departments
TROJAN.dept = function(val, callback, end){
	val = val || {};
	end = end || function(){};

	function dataStitch(data){
		var object = {};
		for(var key in data.department){
			// get higher-level departments (schools)
			if(typeof data.department[key].code != 'undefined') 
				object[data.department[key].code] = data.department[key].name;

			// also get sub departments
			for(var inkey in data.department[key].department){
				if(typeof data.department[key].department[inkey].code != 'undefined') 
					object[data.department[key].department[inkey].code] = data.department[key].department[inkey].name;
			}
		}

		callback(object);
		end();
	}

	function deptCall(term){
		var url = "/depts/" + term;
		urlparse(url, dataStitch);
	}

	if(val.term) deptCall(val.term)
	else TROJAN.current_term(val, deptCall)
}

// get a list of courses from a given department
TROJAN.course_list = function(val, callback, end){
	val = val || {}
	end = end || function(){};

	if(val.dept){
		val.dept = val.dept.toUpperCase()
		function courseListCallback(dept,term,callback){
			var url = "/classes/" + dept + "/" + term
			urlparse(url,function(data) {
				var object = {};
				if(Object.keys(data.OfferedCourses).length > 0){
					var courseHandler = [];
					if(Object.prototype.toString.call(data.OfferedCourses.course) === '[object Array]'){
						courseHandler = data.OfferedCourses.course;
					} else if(Object.prototype.toString.call(data.OfferedCourses.course) === '[object Object]'){
						courseHandler.push(data.OfferedCourses.course);
					}

					for(var key in courseHandler){
						var courseID = courseHandler[key].ScheduledCourseID;
						if(TROJAN.courseIDSplit(courseID)[0] != dept) continue;
						courseID = TROJAN.courseIDSplit(courseID)[3];
						var courseData = courseHandler[key].CourseData;
						object[courseID] = {
							prefix: courseData.prefix || "",
							number: courseData.number || "",
							title: courseData.title || "",
							units: courseData.units || "",
							SectionData: {}
						};

						var handler = [];
						if(Object.prototype.toString.call(courseData.SectionData) === '[object Array]'){
							handler = courseData.SectionData;
						} else if(Object.prototype.toString.call(courseData.SectionData) === '[object Object]'){
							handler.push(courseData.SectionData);
						}

						for(var sectionKey in handler){
							var sectionData = handler[sectionKey];
							if(typeof sectionData.day === 'object') sectionData.day = "";
							object[courseID].SectionData[sectionData.id] = {
								section_title: sectionData.section_title || "",
								units: sectionData.units || "",
								type: sectionData.type || "",
								spaces_available: sectionData.spaces_available || "",
								number_registered: sectionData.number_registered || "",
								canceled: sectionData.canceled || "",
								day: sectionData.day || "",
								start_time: sectionData.start_time || "",
								end_time: sectionData.end_time || "",
								location: sectionData.location || "",
								instructor: sectionData.instructor || {}
							}
						}
					}
				}
				//console.log(object);
				callback(object);
				end();
			})
		}

		if(val.term) courseListCallback(val.dept, val.term, callback);
		else {
			TROJAN.current_term(val, function(term){
				courseListCallback(val.dept, term, callback);
			});
		}
	}
	else {
		callback({error:"Please indicate a department!"});
	}
}

// get object of course, containing its sections
TROJAN.course = function(val, callback, end) {
	val = val || {} // {course, term}

	function courseCall(courseid,val,callback){
		val.dept = courseid[0];
		TROJAN.course_list(val, function(data){
			if(data[courseid[3]+courseid[2]]) callback(data[courseid[3]+courseid[2]]);
			else {
				for(var key in data){
					if(courseid[3] == TROJAN.courseIDSplit(key)[3]){
						callback(data[key]);
						break;
					}
				}
			}
		}, end);
	}

	if(val.course){
		val.course = val.course.toUpperCase();
		var courseid = TROJAN.courseIDSplit(val.course);

		if(courseid) courseCall(courseid,val,callback);
		else callback({error:"courseid format incorrect"});
	} 
	else callback({error: "Need a course"});
}

TROJAN.courseIDSplit = function(courseID){
	var split = courseID.split('-');
	var dept = split[0];
	if(typeof split[1] == 'undefined' || split[1] == '') return false;
	var course = split[1].substring(0, 3);
	var suf = split[1].substring(3) | '';
	if(split.length != 2 || !isNaN(dept) || isNaN(course)) return false;
	return [dept, course, suf, dept+'-'+course];
}

// Node.js
if (typeof module === 'object' && module.exports) {
	module.exports = TROJAN
}

}());