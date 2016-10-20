// api.js router setup
var express = require('express');
var router = express.Router();

// included functions
var generateSchedules = require('./lib/generateSchedules');
var generateSchedulesFirebase = require('./lib/generateScheduleFirebase');
var TROJAN = require('trojan-course-api');
var _ = require('lodash');

// firebase
var db = require('./lib/firebase');

// ROUTES OF API

// middleware
router.use(function (req, res, next) {
  console.log('api call made');
  next();
});

router.route('/')
  .get(function (req, res) {
    res.json({
      messages: "here are some methods you can call",
      rest_api: ['schedule', 'trojan', 'refreshDatabase']
    });
  });

router.route('/refreshDatabase')
  .get(function (req, res) {
    var ref = db.ref('/courses');

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
        ref.update(courses);
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
    if (courses && courses.length > 0) {
      if (!_.isArray(courses)) courses = courses.split(',');
      // taking array of courses, generate schedule
      generateSchedulesFirebase(courses, anchors, function (data) {
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
        db.ref('/courses').update(courseData);
      }
    });
  }
  res.json({ message: 'success', courses });
});

router.route('/schedule/:user_email')
  .post(function (req, res) {
    var userEmail = req.params.user_email.toLowerCase();
    var ref = db.ref('/schedules');
    if (validateEmail(userEmail)) {
      ref.orderByChild('email').equalTo(userEmail).once('value', function(snap) {

        if (!snap.exists()) {
          ref.push({ email: userEmail });
          res.json({
            message: 'new user created',
            user_email: userEmail,
            courses: []
          });
        } else {
          var courses = snap.val()[Object.keys(snap.val())[0]].courses || [];
          var anchors = snap.val()[Object.keys(snap.val())[0]].anchors || {};
          res.json({
            message: 'user exists',
            user_email: userEmail,
            courses: courses,
            anchors: anchors
          });
        }
      });
    } else {
      res.json({
        error: 'not a valid email'
      });
    }
  })
  .put(function (req, res) {
    var userEmail = req.params.user_email.toLowerCase();
    var ref = db.ref('/schedules');
    if (validateEmail(userEmail)) {
      ref.orderByChild('email').equalTo(userEmail).once('value', function(snap) {
        if (!snap.exists()) {
          res.json({
            error: 'cannot mutate, email does not exist',
            user_email: userEmail
          });
        } else {
          let courses = req.body.courses || [];
          let anchors = req.body.anchors || {};

          snap.child(Object.keys(snap.val())[0]).ref.update({
            courses, anchors
          });

          res.json({
            message: 'user data updated',
            user_email: userEmail,
            courses: courses,
            anchors: anchors
          });
        }
      });
    } else {
      res.json({
        error: 'not a valid email'
      });
    }
  })
  .get(function (req, res) {
    var userEmail = req.params.user_email.toLowerCase();
    var ref = db.ref('/schedules');
    if (validateEmail(userEmail)) {
      ref.orderByChild('email').equalTo(userEmail).once('value', function(snap) {
        if (!snap.exists()) {
          res.json({
            error: 'cannot mutate, email does not exist',
            user_email: userEmail
          });
        } else {
          var courses = snap.val()[Object.keys(snap.val())[0]].courses || [];
          var anchors = snap.val()[Object.keys(snap.val())[0]].anchors || {};

          res.json({
            message: 'user data retrieved',
            user_email: userEmail,
            courses: courses,
            anchors: anchors
          });
        }
      });
    } else {
      res.json({
        error: 'not a valid email'
      });
    }
  });

router.route('/verify/:course_id')
  .get(function (req, res) {
    db.ref('/courses').child(req.params.course_id).once('value', function(snap) {
      res.json({ exists: snap.exists() });
      TROJAN.courses(req.params.course_id.split('-')[0])
        .then(function (courseData) {
        if (courseData) {
          db.ref('/courses').update(courseData);
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
    db.ref('/courses')
      .orderByKey()
      .startAt(text)
      .limitToFirst(8)
      // .startAt(text).endAt(text + '\uf8ff')
      // .limit(5)
      // res.json({hello:text})
      .once('value', function (snap) {
        res.json(_.values(_.mapValues(snap.val(), function (coursedata, key) {
          return {
            courseId: key,
            title: coursedata.title
          }
        })));
      });
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
        TROJAN.terms().then(res.json);
        break;
      case 'current_term':
        TROJAN.current_term().then(res.json);
        break;
      case 'depts':
        if (q.term) TROJAN.depts(q.term).then(res.json);
        else res.json({ depts: ['term'] })
        break;
      case 'dept':
        TROJAN.dept(q.dept, q.term).then(res.json);
        break;
      case 'courses':
        TROJAN.courses(q.dept, q.term).then(res.json);
        break;
      case 'dept_info':
        TROJAN.dept_info(q.dept, q.term).then(res.json);
        break;
      case 'course':
        TROJAN.course(q.dept, q.num, q.seq, q.term).then(res.json);
        break;
      case 'section':
        TROJAN.section(q.dept, q.num, q.seq, q.sect, q.term).then(res.json);
        break;
      case 'depts_flat':
        TROJAN.depts_flat(q.term).then(res.json);
        break;
      case 'deptsY':
        TROJAN.deptsY(q.term).then(res.json);
        break;
      case 'deptsC':
        TROJAN.deptsC(q.term).then(res.json);
        break;
      case 'deptsN':
        TROJAN.deptsN(q.term).then(res.json);
        break;
      case 'deptsCN':
        TROJAN.deptsCN(q.term).then(res.json);
        break;
      case 'deptBatch':
        TROJAN.deptBatch(q.depts).then(res.json);
        break;
      default:
        res.json({ error: 'action not found' });
    }
  });


module.exports = router;


function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
