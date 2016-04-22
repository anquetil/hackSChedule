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

    if(val.term) courseListCallback(val.dept, val.term, callback);
    else {
      TROJAN.current_term(val, function(term){
        courseListCallback(val.dept, term, callback);
      });
    }

    function courseListCallback(dept,term,callback){
      var url = "/classes/" + dept + "/" + term
      urlparse(url,function(data) {
        var object = {};
        if(Object.keys(data.OfferedCourses).length > 0){
          var courseHandler = [];
          courseHandler = (Object.prototype.toString.call(data.OfferedCourses.course) === '[object Array]') ?
            data.OfferedCourses.course : [data.OfferedCourses.course];

          for(var key in courseHandler){
            var courseID = courseHandler[key].ScheduledCourseID;
            if(TROJAN.courseIDSplit(courseID)[0] != dept) continue; // weed out duplicates
            courseID = TROJAN.courseIDSplit(courseID)[3];
            var courseData = courseHandler[key].CourseData;
            object[courseID] = {
              prefix: !(typeof courseData.prefix === 'object') ? courseData.prefix || "" : "",
              number: !(typeof courseData.number === 'object') ? courseData.number || "" : "",
              sequence: !(typeof courseData.sequence === 'object') ? courseData.sequence || "" : "",
              title: !(typeof courseData.title === 'object') ? courseData.title || "" : "",
              units: !(typeof courseData.units === 'object') ? courseData.units || "" : "",
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
              object[courseID].SectionData[sectionData.id] = {
                section_title: !(typeof sectionData.section_title === 'object') ? sectionData.section_title || "" : "",
                units: !(typeof sectionData.units === 'object') ? sectionData.units || "" : "",
                type: !(typeof sectionData.type === 'object') ? sectionData.type || "" : "",
                spaces_available: !(typeof sectionData.spaces_available === 'object') ? sectionData.spaces_available || "" : "",
                number_registered: !(typeof sectionData.number_registered === 'object') ? sectionData.number_registered || "" : "",
                canceled: !(typeof sectionData.canceled === 'object') ? sectionData.canceled || "" : "",
                day: !(typeof sectionData.day === 'object') ? sectionData.day || "" : "",
                start_time: !(typeof sectionData.start_time === 'object') ? sectionData.start_time || "" : "",
                end_time: !(typeof sectionData.end_time === 'object') ? sectionData.end_time || "" : "",
                location: !(typeof sectionData.location === 'object') ? sectionData.location || "" : "",
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
      if(data[courseid[3]]) callback(data[courseid[3]]);
      else {
        for(var key in data){
          if(courseid[3] == TROJAN.courseIDSplit(key)[3]){
            callback(data[key]);
            return;
          }
        }
        callback({error: "Course not found."});
      }
    }, end);
  }

  if(val.course){
    var courseid = TROJAN.courseIDSplit(val.course);

    if(courseid) courseCall(courseid,val,callback);
    else callback({error: "Course ID format incorrect"});
  } 
  else callback({error: "Need a course"});
}

TROJAN.courseIDSplit = function(courseID){
  courseID = courseID.toUpperCase();
  var split = courseID.split('-');
  var dept = split[0];
  if(typeof split[1] == 'undefined' || split[1] == '') return false;
  var course = split[1].substring(0, 3);
  var sequence = split[1].substring(3) || '';
  if(split.length != 2 || !isNaN(dept) || isNaN(course)) return false;
  return [dept, course, sequence, dept+'-'+course+sequence];
}

// Node.js
if (typeof module === 'object' && module.exports) {
  module.exports = TROJAN
}

}());