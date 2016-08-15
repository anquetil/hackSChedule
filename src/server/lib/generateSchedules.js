var TROJAN = require('trojan-course-api');
var scheduler = require('scheduler-api');
var _ = require('lodash');
var heuristic = require('./heuristic');

module.exports = function (courses, cb) {
  courses = _.uniq(courses);

  var entities = {};
  var courseData = {};
  for (var course of courses) {
    var courseid = course.split('-');
    if (courseid.length !== 2) return false;
    var dept = courseid[0];
    var num = courseid[1].slice(0, 3);
    var seq = courseid[1].slice(3);
    TROJAN.course(dept, num, seq).then(function (coursedata) {
      var courseid = Object.keys(coursedata)[0];
      var coursedata = coursedata[courseid];
      courseData[courseid] = coursedata;
      TROJAN.combinations(coursedata).then(function (combinations) {
        var data = normalize(coursedata, combinations);
        entities[courseid] = data;

        if (Object.keys(entities).length === courses.length) {
          processEntities(courseData, entities);
        }
      });
    });
  }

  function processEntities(courseData, entities) {
    var bucket = heuristic.generateBuckets(courseData);
    var results = scheduler.combinations.sync(entities);
    results = _.map(results, (scenario) => {
      var combination = _.mapValues(scenario, function(o) {return o.split(',')});
      var score = heuristic(combination, bucket);
      return { combination, score };
    });

    cb({
      courseData,
      results,
    });
  }
};

function normalize(coursedata, combinations) {
  var entity = {};

  for (var bucket of combinations) {
    entity[bucket] = {};
    for (var sectionId of bucket) {
      entity[bucket][sectionId] = coursedata.sections[sectionId].blocks;
    }
  }

  return entity;
}
