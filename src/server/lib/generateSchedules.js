var TROJAN = require('trojan-course-api');
var scheduler = require('scheduler-api');
var _ = require('lodash');
var heuristic = require('./heuristic');

module.exports = function (courses, cb) {
  courses = _.uniq(courses);

  var entities = {};
  var courseData = {};
  for (var course of courses) {
    var course = course.split('-');
    var dept = course[0];
    var num = course[1].slice(0, 3);
    var seq = course[1].slice(3);
    TROJAN.course(dept, num, seq).then(function (coursedata) {
      var courseId = Object.keys(coursedata)[0];
      var coursedata = coursedata[courseId];
      courseData[courseId] = coursedata;
      TROJAN.combinations(coursedata).then(function (combinations) {
        var data = normalize(coursedata, combinations);
        entities[courseId] = data;

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
