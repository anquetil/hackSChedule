// api.js router setup
var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

// included functions
var generateSchedules = require('./lib/generateSchedules');
var generateSchedulesFirebase = require('./lib/generateScheduleFirebase');
var TROJAN = require('trojan-course-api');
var _ = require('lodash');

// firebase
var database = require('./lib/firebase');
var scheduleRef = database.ref('/20171');
var courseRef = database.ref('/courses');

var suffix = '@usc.edu';

// ROUTES OF API

// middleware
// router.use(function (req, res, next) {
//   // console.log('api call made');
//   next();
// });

router.route('/')
  .get(function (req, res) {
    res.json({
      messages: "here are some methods you can call",
      rest_api: ['schedule', 'trojan', 'refreshDatabase']
    });
  });

router.route('/refreshDatabase')
  .get(function (req, res) {

    // get full list of departments with courses
    TROJAN.deptsCN().then(function (dlist) {
      var arrayOfDepts = Object.keys(dlist);

      // we want to iterate through each dept and grab its data,
      // and return the final results once we process the last dept.
      var maxIndex = arrayOfDepts.length;
      var index = 0;

      // this is where the data will be stored.
      var masterCourses = {};

      // now, go through all departments
      TROJAN.deptBatch_cb(arrayOfDepts, null, function (deptData) {
        var courses = deptData.courses;

        // merge it with the master data collector
        masterCourses = _.merge(masterCourses, courses);
        console.log(courses);
        courseRef.update(courses);
        index += 1;

        // once we hit the last index, turn the desc into the key.
        if (maxIndex <= index) {
          res.json(masterCourses);
        }
      });
    });
  });

router.route('/schedule')
  .get(function (req, res) {
    // for testing purposes only
    var courses = req.query.courses;
    var anchors = req.query.anchors;
    var blocks = req.query.blocks;
    if (courses && courses.length > 0) {
      if (!_.isArray(courses)) courses = courses.split(',');
      // taking array of courses, generate schedule
      generateSchedulesFirebase(courses, anchors, blocks, function (data) {
        // sort results by score
        data.results.sort(function (a, b) {
          if (a.score < b.score) return -1;
          else if (a.score > b.score) return 1;
          else return 0;
        });

        // respond json
        res.json(data);
      });
    } else {
      res.json({
        error: 'no courses defined'
      });
    }
  });

router.route('/update_server').post(function (req, res) {
  var courses = req.query.courses || [];
  // due diligence
  var uniqCourses = _.uniq(courses.map(function (courseId) { return courseId.split('-')[0]; }));
  for (var id of uniqCourses) {
    TROJAN.courses(id).then(function (courseData) {
      if (courseData) {
        courseRef.update(courseData);
      }
    });
  }
  res.json({ message: 'success', courses });
});

router.route('/schedule/:user_email')
  .post(function (req, res) {
		
    var userEmail = req.params.user_email.toLowerCase();
    var userName = userEmail.split('@')[0].replace('.', '-');

    if (isEmailValid(userEmail)) {
      userEmail = userEmail.split('@')[0].replace('.', '-');
      scheduleRef.orderByKey().equalTo(userEmail)
        .once('value')
        .then(function(snap) {

          if (!snap.exists()) {
            scheduleRef.child(userEmail).set({
              ts: Date.now(),
              email: req.params.user_email.toLowerCase(),
              courses: [],
              anchors: {},
              blocks: []
            });
            res.json({
              message: 'new user created',
              user_email: req.params.user_email.toLowerCase(),
              courses: [],
              anchors: {},
              blocks: []
            });
          } else {
            var courses = snap.val()[userEmail].courses || [];
            var anchors = snap.val()[userEmail].anchors || {};
            var blocks = snap.val()[userEmail].blocks || [];
            res.json({
              message: 'user exists',
              user_email: req.params.user_email.toLowerCase(),
              courses: courses,
              anchors: anchors,
              blocks: blocks,
            });
          }
        }).catch(function (e) {
          return res.status(400).json({ error: e.message });
        });
    } else {
      res.json({
        error: 'not a valid email'
      });
    }
  })
  .put(function (req, res) {
		// updates the information in the database
		// sends back a 202 (data accepted) with the

    var userEmail = req.params.user_email.toLowerCase();
    var userName = userEmail.split('@')[0].replace('.', '-');

		var newCourses = req.body.courses;
		var newAnchors = req.body.anchors;
		var newBlocks = req.body.blocks;

    if (isEmailValid(userEmail)) {
      userEmail = userEmail.split('@')[0].replace('.', '-');
      scheduleRef
				.orderByKey()
				.equalTo(userEmail)
				.once('value')
        .then(function (snap) {
          if (!snap.exists()) {
						res.status(400).json(userDoesNotExist(res, userEmail))
					} else {
            var rawData = snap.val()[userName];
						var newData = resolveNewData(rawData, newCourses, newAnchors, newBlocks);
            updateScheduleFor(userName, newData)
            res.status(202).json(createUserDataReturnMessage(userName, userEmail, newData))
          }
        }).catch(function (e) {
          res.status(400).json(createErrorMessage(e.message));
        });
    } else res.status(400).json(emailNotValid(res, userEmail))

		function resolveNewData(rawData, newCourses, newAnchors, newBlocks) {
			var toRet = {};

			if (newCourses) {
				toRet['courses'] = resolveCourses(rawData['courses'], newCourses);
			}

			if (newAnchors) {
				toRet['anchors'] = resolveAnchors(rawData['anchors'], newAnchors);
			}

			if (newBlocks) {
				toRet['blocks'] = resolveBlocks(rawData['blocks'], newBlocks);
			}

			return toRet;
		}

		function resolveCourses(courses, newCourses) {
			return _.union(courses, newCourses)
		}

		function resolveAnchors(anchors, newAnchors) {
			return _.assignIn(anchors, newAnchors)
		}

		function resolveBlocks(blocks, newBlocks) {
			return _.union(blocks, newBlocks)
		}

		function updateScheduleFor(userName, newData) {
			return scheduleRef.child(userName).update(newData)
		}
  })
  .get(function (req, res) {
    var userEmail = req.params.user_email.toLowerCase();
    var userName = userEmail.split('@')[0].replace('.', '-');

    if (isEmailValid(userEmail)) {
      scheduleRef
				.orderByKey()
				.equalTo(userName)
				.once('value')
				.then(function (snap) {
					if (!snap.exists()) {
						res.status(400).json(userDoesNotExist(userEmail))
					} else {
						var rawData = snap.val()[userName];
						res.status(200).json(createUserDataReturnMessage(userName, userEmail, rawData))
					}
				}).catch(function (e) {
          res.status(400).json(createErrorMessage(e.message));
        });
    } else res.status(400)
			.json(emailNotValid(userEmail))
  });

function userDoesNotExist(userEmail) {
	return {
		error: 'cannot mutate, email does not exist',
		user_email: userEmail
	}
}

function emailNotValid(userEmail) {
	return {
		error: 'not a valid email',
		user_email: userEmail
	}
}

function createUserDataReturnMessage(userName, userEmail, rawData) {
	var courses = rawData['courses'] || [];
	var anchors = rawData['anchors'] || [];
	var blocks = rawData['blocks'] || [];

	return {
		user_name: userName
		user_email: userEmail,
		courses: courses,
		anchors: anchors,
		blocks: blocks
	}
}

function createErrorMessage(errorMessage) {
	return {
		error: errorMessage
	}
}

router.route('/verify/:course_id')
  .get(function (req, res) {
    courseRef.child(req.params.course_id).once('value', function(snap) {
      res.json({ exists: snap.exists() });
      TROJAN.courses(req.params.course_id.split('-')[0])
        .then(function (courseData) {
        if (courseData) {
          courseRef.update(courseData);
        }
      });
    });
  });

router.route('/autocomplete')
  .get(function(req, res) {
    res.json([]);
  });
router.route('/autocomplete/:text')
  .get(function (req, res) {
    var text = req.params.text;
    text = text.toUpperCase();
    courseRef
      .orderByKey()
      .startAt(text)
      .limitToFirst(8)
      // .startAt(text).endAt(text + '\uf8ff')
      // .limit(5)
      // res.json({hello:text})
      .once('value')
      .then(function (snap) {
        res.json(_.values(_.mapValues(snap.val(), function (coursedata, key) {
          return {
            courseId: key,
            title: coursedata.title
          }
        })));
      }).catch(function (e) {
        return res.status(400).json({ error: e.message });
      });
  });

router.route('/upload/:user_email')
  .post(function (req, res) {

    var userEmail = req.params.user_email.toLowerCase();

    if (isEmailValid(userEmail) && 'data' in req.body) {
      userEmail = userEmail.split('@')[0].replace('.', '-');

      var data = req.body.data.replace(/^data:image\/\w+;base64,/, "");
      var dest = '../../www/screenshots/';
      var buf = new Buffer(data, 'base64');

      scheduleRef.orderByKey().equalTo(userEmail).once('value', function(snap) {

        if (!snap.exists()) {
          res.json({ error: 'not a valid email' });
        } else {
          var destination = path.join(__dirname, 'screenshots/' + snap.key + '.jpg')
          fs.writeFile(destination, buf, (err) => {
            if (err) {
              res.json({
                error: 'unable to upload file',
                why: err
              });
            } else {
              res.json({
                message: 'file uploaded',
                user_email: req.params.user_email.toLowerCase(),
                url: 'screenshots/' + snap.key + '.jpg'
              });
            }
          });
        }
      });
    } else {
      res.json({ error: 'not a valid email or file' });
    }

  });

router.route('/trojan')
  .get(function (req, res) {
    res.json({
      trojan: ['terms', 'current_term', 'depts', 'dept', 'courses', 'dept_info', 'course', 'section', 'depts_flat', 'deptsY', 'deptsC', 'deptsN', 'deptsCN', 'deptBatch']
    });
  });

router.route('/trojan/:action')
  .get(function (req, res) {
    var action = req.params.action;
    var q = req.query;

    switch (action) {
      case 'terms':
        TROJAN.terms().then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'current_term':
        TROJAN.current_term().then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'depts':
        if (q.term) TROJAN.depts(q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        else res.json({ depts: ['term'] })
        break;
      case 'dept':
        TROJAN.dept(q.dept, q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'courses':
        TROJAN.courses(q.dept, q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'dept_info':
        TROJAN.dept_info(q.dept, q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'course':
        TROJAN.course(q.dept, q.num, q.seq, q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'section':
        TROJAN.section(q.dept, q.num, q.seq, q.sect, q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'depts_flat':
        TROJAN.depts_flat(q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'deptsY':
        TROJAN.deptsY(q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'deptsC':
        TROJAN.deptsC(q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'deptsN':
        TROJAN.deptsN(q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'deptsCN':
        TROJAN.deptsCN(q.term).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      case 'deptBatch':
        TROJAN.deptBatch(q.depts).then(res.json).catch(function (e) { return res.status(400).json({ error: e.message }) });
        break;
      default:
        res.json({ error: 'action not found' });
    }
  });

router.route('/usercount')
  .get(function (req, res) {
    scheduleRef.once("value", function(snapshot) {
      res.json({
        userCount: snapshot.numChildren()
      });
    });
  });


module.exports = router;


function isEmailValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email) && email.indexOf('@usc.edu') > 1;
}
