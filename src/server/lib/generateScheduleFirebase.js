var TROJAN = require('trojan-course-api');
var scheduler = require('scheduler-api');
var _ = require('lodash');
var heuristic = require('./heuristic');

var db = require('./firebase');

module.exports = function (courses = [], anchors = {}, cb) {
  courses = _.uniq(courses);

  var ref = db.ref('/courses');

  var entities = {};
  var courseData = {};
  for (var course of courses) {
    var course = course.split('-');
    var dept = course[0];
    var num = course[1].slice(0, 3);
    var seq = course[1].slice(3);

    // ping the server
    ref.child(dept+'-'+num+seq).once('value', function(snap) {
      if (snap.exists()) {
        var coursedata = snap.val();
        var courseId = snap.key;
        courseData[courseId] = coursedata;
        TROJAN.combinations(coursedata).then(function (combinations) {
          var data = normalize(coursedata, combinations);
          entities[courseId] = data;

          if (Object.keys(entities).length === courses.length) {
            processEntities(courseData, entities);
          }
        });
      }
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

    results = _.filter(results, (scenario) => {
      for (var id in scenario.combination) {
        if (anchors[id]) {
          if (_.intersection(scenario.combination[id], anchors[id]).length < anchors[id].length) {
            return false;
          }
        }
      }
      return true;
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
