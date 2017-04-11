var TROJAN = require('trojan-course-api');
var Promise = require('bluebird');
var scheduler = require('scheduler-api');
var _ = require('lodash');

var database = require('./database');
var heuristic = require('../lib/heuristic');
var combinations = require('../lib/combinations');

var coursesRef = database.coursesRef;
var sectionsRef = database.sectionsRef;

module.exports = function (courses, anchors, blocks) {
	return new Promise(function (resolve, reject) {
		// ================
		// normalize the parameter values

		courses = courses || [];
		anchors = anchors || {};
		blocks = blocks || {};

		// save only enabled courses
		if (!_.isArray(courses)) {
			courses = Object.keys(courses).filter(function (courseId) {
				return courses[courseId];
			});
		}

		// turn enabled anchor sections into arrays
		anchors = _.mapValues(anchors, function (value, key) {
			if (!_.isArray(value)) {
				return Object.keys(value).filter(function (sectionId) {
					return value[sectionId];
				});
			}
			return value;
		});

		// turn blocks into array
		if (!_.isArray(blocks)) {
			blocks = _.toArray(blocks);
		}

		if(courses.length === 0) {
			return resolve([]);
		}

		// =================
		// begin preparing data to be processed by scheduling algorithm

	  var entities = {};
	  var courseEntityCounter = 0;

	  // first, add custom blocks (if they exist)
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
	  for (var courseId of courses) {
	    courseId = TROJAN.parseCourseId(courseId)['course_id'];

	    // ping the server
	    sectionsRef.child(courseId).once('value')
				.then(function(snap) {
					var courseId = snap.key;
					// grab data from database
		      if (snap.exists()) {
		        var sections = snap.val();
		        return combinations({ sections })
							.then(function (combinations) {
								return new Promise(function (resolve) {
									resolve({ courseId, sections, combinations, anchors });
								});
							});
		      } else {
						throw new Error('course does not exist');
					}
		    })
				.then (function (data) {
					// filter out combinational items that are not anchored
					// to reduce computing steps
					var courseId = data.courseId;
					var sections = data.sections;
					var combinations = data.combinations;
					var anchors = data.anchors[courseId] || [];

					// convertToMin
					for (var sectionId in sections) {
						var sectionData = sections[sectionId];
						//quickfix
						if (!_.isArray(sectionData.blocks)) {
							sectionData.blocks = _.values(sectionData.blocks);
						}
						for (var block of sectionData.blocks) {
							Object.assign(block, {
								start: convertToMin(block.start),
								end: convertToMin(block.end),
								full: (sectionData.number_registered >= sectionData.spaces_available),
								type: (sectionData.type),
							})
						}
					}

					return new Promise(function (resolve) {
						if (anchors.length > 0) {
							combinations = _.filter(combinations, function (sections) {
								var intersections = _.intersectionWith(sections, anchors, function (a, b) {
									return a.split('/').indexOf(b) > -1;
								});
								return (intersections.length == anchors.length);
							});
						}
						resolve({ courseId, sections, combinations });
					});
				})
				.then (function (data) {
					// normalize the data for scheduler-api
					var courseId = data.courseId;
					var sections = data.sections;
					var combinations = data.combinations;

					return new Promise(function(resolve) {
						var entity = {};

					  for (var scenario of combinations) {
					    entity[scenario] = {};
					    for (var sectionId of scenario) {
								var firstSectionId = sectionId.split('/')[0];
					      entity[scenario][sectionId] = sections[firstSectionId].blocks;
					      if (sections[firstSectionId].type == 'Qz') {
					        entity[scenario][sectionId].map(function (o) {
					          return o.transient = true;
					        });
					      }
					    }
					  }

					  resolve({ courseId, entity });
					});
				})
				.then(function (data) {
					var entity = data.entity;
					var courseId = data.courseId;

					entities[courseId] = entity;
					courseEntityCounter += 1;

					if (courseEntityCounter === courses.length) {
						processEntities();
					}
				})
				.catch(function (e) {
					courseEntityCounter += 1;
					reject(e);
				});
	  }

	  function processEntities() {
	    // this also converts the time into integers:
	    // var bucket = heuristic.generateBuckets(courseData);
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
	      // var score = heuristic(combination, bucket);
	      return combination;
	    });

	    resolve(results);
	  }
	});
};

function convertToMin(time) {
	// ex: convert '13:50' to '830'
	if (!time) return null;
	if (Number.isInteger(time)) return time;
	var time = time.split(':');
	if (time.length != 2) return parseInt(time);
	return Math.round(time[0]) * 60 + Math.round(time[1]);
}
