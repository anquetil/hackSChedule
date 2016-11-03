var TROJAN = require('trojan-course-api');
var scheduler = require('scheduler-api');
var _ = require('lodash');
var heuristic = require('./heuristic');

var db = require('./firebase');

module.exports = function (courses = [], anchors = {}, blocks = [], cb) {
  courses = _.uniq(courses);

  var ref = db.ref('/courses');

  var entities = {};
  var courseData = {};
  var courseEntityCounter = 0;

  // first, add custom blocks (if existant)
  if (blocks.length > 0) {
    var entity = { user_scenario: {} };

    for (var i in blocks) {
      entity.user_scenario[i] = [{
        start: parseInt(blocks[i].start),
        end: parseInt(blocks[i].end),
        day: blocks[i].day
      }];
    }
    entities['user_entity'] = entity;
  }

  // then, add course entities
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
          courseEntityCounter += 1;

          if (courseEntityCounter === courses.length) {
            processEntities();
          }
        });
      }
    });
  }

  function processEntities() {
    // this also converts the time into integers:
    var bucket = heuristic.generateBuckets(courseData);
    var results = scheduler.combinations.sync(entities);

    // remove non-relevant data
    if ('user_entity' in entities) {
      results = results.map(function (scenario) {
        delete scenario.user_entity;
        return scenario;
      });
    }

    results = _.map(results, function (scenario) {
      var combination = _.mapValues(scenario, function(o) {return o.split(',')});
      var score = heuristic(combination, bucket);
      return { combination, score };
    });

    results = _.filter(results, function (scenario) {
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

  for (var scenario of combinations) {
    entity[scenario] = {};
    for (var sectionId of scenario) {
      entity[scenario][sectionId] = coursedata.sections[sectionId].blocks;
      // .map(function (obj) {
      //   obj.start = heuristic.convertToMin(obj.start);
      //   obj.end = heuristic.convertToMin(obj.end);
      //   return obj;
      // });
      if (coursedata.sections[sectionId].type == 'Qz') {
        entity[scenario][sectionId].map(function (o) {
          return o.transient = true;
        });
      }
    }
  }

  return entity;
}
